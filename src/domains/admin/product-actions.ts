'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
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
 * Robust CSV parser for Shopify imports.
 */
function parseSerializedCSV(text: string) {
    const rows: any[] = []
    let currentField = ''
    let inQuotes = false
    let currentRow: string[] = []

    const normalized = text.replace(/\r\n/g, '\n')

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i]
        const nextChar = normalized[i + 1]

        if (char === '"' && inQuotes && nextChar === '"') {
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
 * [NEW] Duplicate a product and its variants.
 */
export async function duplicateProduct(productId: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

    if (fetchError || !product) throw new Error("Produit introuvable")

    const newProduct = {
        ...product,
        id: undefined,
        name: `${product.name} (Copie)`,
        slug: `${product.slug}-copy-${Math.random().toString(36).substring(2, 7)}`,
        created_at: undefined,
        updated_at: undefined,
        active: false
    }

    const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single()

    if (insertError || !insertedProduct) throw new Error(`Erreur lors de la duplication: ${insertError?.message}`)

    const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)

    if (variants && variants.length > 0) {
        const newVariants = variants.map(v => ({
            ...v,
            id: undefined,
            product_id: insertedProduct.id,
            sku: `${v.sku}-COPY`,
            created_at: undefined,
            updated_at: undefined
        }))
        await supabase.from('product_variants').insert(newVariants)
    }

    revalidatePath('/[locale]/(admin)/admin/products', 'page')
    return { success: true, id: insertedProduct.id }
}

/**
 * List products for admin.
 */
export async function getAdminProducts() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(name),
            product_variants(*)
        `)
        .order('name')

    if (error) throw new Error(error.message)
    return data
}

/**
 * Shopify CSV Import.
 */
export async function importProductsCSV(formData: FormData) {
    await ensureAdmin()
    const file = formData.get('file') as File
    if (!file) throw new Error("Aucun fichier reçu")

    const supabase = await createClient()
    const adminId = (await supabase.auth.getUser()).data.user?.id

    const text = await file.text()
    const rows = parseSerializedCSV(text)

    const results = { created: 0, updated: 0, errors: 0, details: [] as any[] }
    const groupedProducts: Record<string, any[]> = {}

    for (const row of rows) {
        const handle = row['handle']
        if (!handle) continue
        if (!groupedProducts[handle]) groupedProducts[handle] = []
        groupedProducts[handle].push(row)
    }

    for (const handle in groupedProducts) {
        try {
            const variantRows = groupedProducts[handle]
            const firstRow = variantRows[0]
            const title = firstRow['title']
            const bodyHtml = firstRow['body (html)'] || firstRow['body_html'] || firstRow['description']
            const vendor = firstRow['vendor'] || 'Dermakor'
            const productType = firstRow['type']
            const tags = firstRow['tags'] ? firstRow['tags'].split(',').map((t: string) => t.trim()) : []
            const categoryName = firstRow['product category'] || firstRow['category']

            if (!title) throw new Error(`Missing Title for handle: ${handle}`)

            let categoryId: string | undefined = undefined
            if (categoryName) {
                const { data: catData } = await supabase.from('categories').select('id').ilike('name', categoryName).single()
                categoryId = catData?.id
            }

            const images = Array.from(new Set(variantRows.map(r => r['image src'] || r['image_src'] || r['image']).filter(Boolean)))

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
                .select().single()

            if (prodErr) throw prodErr
            const productId = upsertedProd.id

            for (const vRow of variantRows) {
                let sku = (vRow['variant sku'] || vRow['sku'] || "").trim()
                if (!sku) {
                    const hashInput = `${handle}-${vRow['option1 value'] || ""}-${vRow['option2 value'] || ""}-${vRow['option3 value'] || ""}`
                    sku = `${handle.substring(0, 15).toUpperCase()}-${generateDeterministicHash(hashInput)}`
                }
                const price = parseFloat(vRow['variant price'] || vRow['price'] || "0")
                const comparePrice = parseFloat(vRow['variant compare at price'] || vRow['compare_at_price'] || "0")
                const stock = Math.max(0, parseInt(String(vRow['variant inventory qty'] || vRow['stock'] || "0")) || 0)

                await supabase.from('product_variants').upsert({
                    product_id: productId,
                    sku,
                    base_price_cents: Math.round(price * 100),
                    compare_at_price_cents: comparePrice > 0 ? Math.round(comparePrice * 100) : null,
                    stock_count: stock,
                    barcode: vRow['variant barcode'] || vRow['barcode'],
                    attributes: {
                        ...(vRow['option1 name'] && vRow['option1 value'] && { [vRow['option1 name']]: vRow['option1 value'] }),
                        ...(vRow['option2 name'] && vRow['option2 value'] && { [vRow['option2 name']]: vRow['option2 value'] }),
                        ...(vRow['option3 name'] && vRow['option3 value'] && { [vRow['option3 name']]: vRow['option3 value'] })
                    }
                }, { onConflict: 'sku' })
                results.updated++
            }
        } catch (e: any) {
            results.errors++
            results.details.push({ handle, error: e.message })
        }
    }

    await supabase.from('audit_logs').insert({ admin_id: adminId, action: 'CSV_IMPORT_SHOPIFY', resource_type: 'products', payload: results })
    revalidatePath('/admin/inventory')
    return results
}

/**
 * Basic Helpers.
 */
export async function adjustStock(variantId: string, amount: number, reason: string) {
    await ensureAdmin()
    const supabase = await createClient()
    const { data: v } = await supabase.from('product_variants').select('stock_count').eq('id', variantId).single()
    const newStock = (v?.stock_count || 0) + amount
    await supabase.from('product_variants').update({ stock_count: newStock }).eq('id', variantId)
    revalidatePath('/admin/inventory')
    return { success: true }
}

export async function deleteProduct(productId: string) {
    await ensureAdmin()
    const supabase = await createClient()
    await supabase.from('product_variants').delete().eq('product_id', productId)
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/inventory')
    revalidatePath('/[locale]/(admin)/admin/products', 'page')
    return { success: true }
}

export async function deleteVariant(variantId: string) {
    await ensureAdmin()
    const supabase = await createClient()
    await supabase.from('product_variants').delete().eq('id', variantId)
    revalidatePath('/admin/inventory')
    return { success: true }
}

export async function updateProductDetails(productId: string, data: any) {
    await ensureAdmin()
    const supabase = await createClient()

    // Extract form-only fields that don't belong to the `products` table
    const {
        id, created_at, updated_at, product_variants,
        price, comparePrice, weight_grams,
        costPerItem, // display-only, not stored
        ...updateData
    } = data

    // Update the product row
    const { error } = await supabase.from('products').update(updateData).eq('id', productId)
    if (error) throw new Error(error.message)

    // Sync price, comparePrice and weight_grams to product_variants
    const variantUpdate: Record<string, any> = {}
    if (price) variantUpdate.base_price_cents = Math.round(parseFloat(price) * 100)
    if (comparePrice !== undefined) {
        const cp = parseFloat(comparePrice)
        variantUpdate.compare_at_price_cents = cp > 0 ? Math.round(cp * 100) : null
    }
    if (weight_grams !== undefined) variantUpdate.weight_grams = Number(weight_grams) || 0

    if (Object.keys(variantUpdate).length > 0) {
        await supabase.from('product_variants').update(variantUpdate).eq('product_id', productId)
    }

    revalidatePath('/admin/products')
    revalidatePath('/admin/inventory')
    revalidatePath('/app/shop')
    return { success: true }
}

export async function getAdminCategoriesWithCount() {
    await ensureAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase.from('categories').select('id, name, slug, products(id)').order('name')
    if (error) throw new Error(error.message)
    return data.map(c => ({ id: c.id, name: c.name, slug: c.slug, product_count: (c.products as any[]).length }))
}

export async function getAdminCategoryDetail(id: string) {
    await ensureAdmin()
    const supabase = await createClient()
    const { data: category } = await supabase.from('categories').select('*').eq('id', id).single()
    const { data: products } = await supabase.from('products').select('*, product_variants(*)').eq('category_id', id).order('name')
    return { ...category, products: products || [] }
}
