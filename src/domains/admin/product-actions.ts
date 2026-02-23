'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'
import * as fs from 'fs'

/**
 * Deterministic hash for SKU generation.
 */
function generateDeterministicHash(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
}


/**
 * List products and variants for admin.
 */
export async function getAdminProducts() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      product_variants(*)
    `)
        .order('name')

    if (error) throw new Error(error.message)
    return data
}

/**
 * Handle CSV Import for Products, Variants, and Stock.
 */
/**
 * Robust CSV parser that handles:
 * 1. Multiline fields (quoted)
 * 2. Escaped quotes
 * 3. Consistent column mapping
 */
function parseSerializedCSV(text: string) {
    const rows: any[] = []
    let currentField = ''
    let inQuotes = false
    let currentRow: string[] = []

    // Normalize line endings
    const normalized = text.replace(/\r\n/g, '\n')

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i]
        const nextChar = normalized[i + 1]

        if (char === '"' && inQuotes && nextChar === '"') {
            // Escaped quote
            currentField += '"'
            i++
        } else if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim())
            currentField = ''
        } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentField.trim())
            rows.push(currentRow)
            currentRow = []
            currentField = ''
        } else {
            currentField += char
        }
    }

    // Last row if no trailing newline
    if (currentRow.length > 0 || currentField) {
        currentRow.push(currentField.trim())
        rows.push(currentRow)
    }

    if (rows.length < 2) return []

    const headers = rows[0].map((h: string) => h.toLowerCase().trim())
    return rows.slice(1).map(row => {
        return headers.reduce((obj: any, header: string, i: number) => {
            obj[header] = row[i]
            return obj
        }, {})
    })
}

/**
 * Handle CSV Import for Products, Variants, and Stock using FormData (Production-Ready).
 */
export async function importProductsCSV(formData: FormData) {
    await ensureAdmin()
    const file = formData.get('file') as File
    if (!file) throw new Error("Aucun fichier reçu")

    const supabase = await createClient()
    const adminId = (await supabase.auth.getUser()).data.user?.id

    const text = await file.text()
    const rows = parseSerializedCSV(text)

    // DEBUG: Write rows to a file to see what we are getting
    try {
        fs.writeFileSync('import_debug.json', JSON.stringify({
            headers: text.split('\n')[0],
            rowCount: rows.length,
            sampleRow: rows[0],
            allRowsSample: rows.slice(0, 5)
        }, null, 2))
    } catch (e) {
        console.error("Failed to write debug file", e)
    }

    const results = { created: 0, updated: 0, errors: 0, details: [] as any[] }

    // 1. Group rows by 'handle'
    const groupedProducts: Record<string, any[]> = {}
    for (const row of rows) {
        const handle = row['handle']
        if (!handle) continue
        if (!groupedProducts[handle]) groupedProducts[handle] = []
        groupedProducts[handle].push(row)
    }

    // 2. Process each Group
    for (const handle in groupedProducts) {
        try {
            const variantRows = groupedProducts[handle]
            const firstRow = variantRows[0]

            // Product Details
            const title = firstRow['title']
            const bodyHtml = firstRow['body (html)'] || firstRow['body_html'] || firstRow['description']
            const vendor = firstRow['vendor'] || 'Dermakor'
            const productType = firstRow['type']
            const tags = firstRow['tags'] ? firstRow['tags'].split(',').map((t: string) => t.trim()) : []
            const categoryName = firstRow['product category'] || firstRow['category']

            if (!title) throw new Error(`Missing Title for handle: ${handle}`)

            // Resolve Category
            let categoryId: string | undefined = undefined
            if (categoryName) {
                const { data: catData } = await supabase
                    .from('categories')
                    .select('id')
                    .ilike('name', categoryName)
                    .single()
                categoryId = catData?.id
            }

            // Collect all images from the group
            const images = Array.from(new Set(
                variantRows.map(r => r['image src'] || r['image_src'] || r['image'])
                    .filter(Boolean)
            ))

            // 3. Find or Create Product (Idempotent)
            const { data: upsertedProd, error: prodErr } = await supabase
                .from('products')
                .upsert({
                    name: title,
                    slug: handle,
                    description: bodyHtml,
                    vendor,
                    type: productType,
                    tags,
                    category_id: categoryId,
                    images: images as string[]
                }, { onConflict: 'slug' })
                .select()
                .single()

            if (prodErr) throw prodErr
            const productId = upsertedProd.id

            // 4. Process Variants
            let rowIndex = 0
            for (const vRow of variantRows) {
                rowIndex++
                let sku = (vRow['variant sku'] || vRow['sku'] || "").trim()

                // Deterministic SKU if empty
                if (!sku) {
                    const opt1 = vRow['option1 value'] || ""
                    const opt2 = vRow['option2 value'] || ""
                    const opt3 = vRow['option3 value'] || ""
                    const hashInput = `${handle}-${opt1}-${opt2}-${opt3}-${rowIndex}`
                    const hash = generateDeterministicHash(hashInput)
                    sku = `${handle.substring(0, 15).toUpperCase()}-${hash}`
                }

                const price = parseFloat(vRow['variant price'] || vRow['price'] || "0")
                const comparePrice = parseFloat(vRow['variant compare at price'] || vRow['compare_at_price'] || "0")

                // Asegurar que el stock sea un entero válido >= 0
                const rawStock = vRow['variant inventory qty'] || vRow['stock'] || "0"
                const stock = Math.max(0, parseInt(String(rawStock)) || 0)

                const barcode = vRow['variant barcode'] || vRow['barcode']

                // Options / Attributes
                const attributes: any = {}
                const opt1Name = vRow['option1 name']
                const opt1Value = vRow['option1 value']
                if (opt1Name && opt1Value) attributes[opt1Name] = opt1Value

                const opt2Name = vRow['option2 name']
                const opt2Value = vRow['option2 value']
                if (opt2Name && opt2Value) attributes[opt2Name] = opt2Value

                const opt3Name = vRow['option3 name']
                const opt3Value = vRow['option3 value']
                if (opt3Name && opt3Value) attributes[opt3Name] = opt3Value

                // Upsert Variant (Idempotent by SKU)
                const variantData = {
                    product_id: productId,
                    sku,
                    base_price_cents: Math.round(price * 100),
                    compare_at_price_cents: (comparePrice && comparePrice > 0) ? Math.round(comparePrice * 100) : null,
                    stock_count: stock,
                    barcode,
                    attributes
                }

                const { data: upsertedVar, error: varErr } = await supabase
                    .from('product_variants')
                    .upsert(variantData, { onConflict: 'sku' })
                    .select('id')
                    .single()

                if (varErr) throw varErr

                // For results tracking, we could check if it was truly a new row,
                // but for now we count it as 'updated' to signal it was processed via upsert.
                results.updated++
            }

        } catch (e: any) {
            results.errors++
            results.details.push({ handle, error: e.message })
        }
    }

    // Audit Log
    await supabase.from('audit_logs').insert({
        admin_id: adminId,
        action: 'CSV_IMPORT_SHOPIFY_V2_FORM_DATA',
        resource_type: 'products',
        payload: { created: results.created, updated: results.updated, errors: results.errors }
    })

    revalidatePath('/admin/inventory')
    return results
}

/**
 * Adjust stock manually (+/-).
 */
export async function adjustStock(variantId: string, amount: number, reason: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { data: variant } = await supabase
        .from('product_variants')
        .select('stock_count')
        .eq('id', variantId)
        .single()

    const newStock = (variant?.stock_count || 0) + amount

    const { error } = await supabase
        .from('product_variants')
        .update({ stock_count: newStock })
        .eq('id', variantId)

    if (error) throw new Error(error.message)

    // Audit Log
    await supabase.from('audit_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'STOCK_ADJUSTMENT',
        resource_type: 'product_variants',
        resource_id: variantId,
        payload: { amount, new_stock: newStock, reason }
    })


    revalidatePath('/admin/inventory')
    return { success: true }
}

/**
 * Delete a product and all its variants.
 */
export async function deleteProduct(productId: string) {
    await ensureAdmin()
    const supabase = await createClient()

    // Delete variants first (if no cascade)
    await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/inventory')
    return { success: true }
}

/**
 * Delete a specific variant.
 */
export async function deleteVariant(variantId: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/inventory')
    return { success: true }
}

/**
 * Update product basic details (Admin)
 */
export async function updateProductDetails(
    productId: string,
    data: {
        name: string,
        slug: string,
        description: string | null,
        category_id: string | null,
        images: string[] | null,
        vendor?: string,
        type?: string,
        tags?: string[],
        price?: string // as decimal string
    }
) {
    await ensureAdmin()
    const supabase = await createClient()

    // 1. Update Product Table
    const { error: prodError } = await supabase
        .from('products')
        .update({
            name: data.name,
            slug: data.slug,
            description: data.description,
            category_id: data.category_id,
            images: data.images,
            vendor: data.vendor,
            type: data.type,
            tags: data.tags
        })
        .eq('id', productId)

    if (prodError) throw new Error(prodError.message)

    // 2. Update Price in Variants (Primary Variant)
    if (data.price) {
        const priceCents = Math.round(parseFloat(data.price) * 100)

        // Update all variants of this product (simplification for MVP where 1 prod = 1 price)
        // Or focus on the 'active' ones.
        const { error: varError } = await supabase
            .from('product_variants')
            .update({ base_price_cents: priceCents })
            .eq('product_id', productId)

        if (varError) throw new Error(varError.message)
    }

    revalidatePath('/admin/products')
    revalidatePath('/admin/inventory')
    revalidatePath('/app/shop')
    revalidatePath(`/app/shop/${data.slug}`)

    return { success: true }
}

/**
 * List categories with product counts for admin.
 */
export async function getAdminCategoriesWithCount() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categories')
        .select(`
            id,
            name,
            slug,
            products(id)
        `)
        .order('name')

    if (error) throw new Error(error.message)

    return data.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        product_count: (c.products as any[]).length
    }))
}

/**
 * Get category detail with products.
 */
export async function getAdminCategoryDetail(categoryId: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()

    if (catError) throw new Error(catError.message)

    const { data: products, error: prodError } = await supabase
        .from('products')
        .select(`
            *,
            product_variants(*)
        `)
        .eq('category_id', categoryId)
        .order('name')

    if (prodError) throw new Error(prodError.message)

    return {
        ...category,
        products
    }
}
