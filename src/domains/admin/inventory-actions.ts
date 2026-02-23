'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'

interface BulkUpdateResult {
    successCount: number
    errorCount: number
    errors: { id: string; reason: string }[]
}

/**
 * Perform bulk updates on variants.
 * Supports manual list of IDs or global filter.
 */
export async function bulkUpdateVariants(params: {
    mode: 'MANUAL' | 'ALL_MATCHING'
    variantIds?: string[]
    excludedIds?: string[]
    filter?: { search?: string; categoryId?: string }
    updates: {
        base_price_cents?: number
        stock_count?: number
    }
}): Promise<BulkUpdateResult> {
    await ensureAdmin()
    const supabase = await createClient()

    const { mode, variantIds, excludedIds, filter, updates } = params
    let targetIds: string[] = []

    // 1. Resolve Target IDs if in ALL_MATCHING mode
    if (mode === 'ALL_MATCHING') {
        let query = supabase.from('product_variants').select('id, products!inner(id, name, category_id)')

        if (filter?.search) {
            query = query.or(`sku.ilike.%${filter.search}%, products.name.ilike.%${filter.search}%`)
        }
        if (filter?.categoryId) {
            query = query.eq('products.category_id', filter.categoryId)
        }

        const { data, error } = await query
        if (error) throw new Error(`Failed to resolve variants: ${error.message}`)

        targetIds = data.map(v => v.id)
        if (excludedIds && excludedIds.length > 0) {
            const excludeSet = new Set(excludedIds)
            targetIds = targetIds.filter(id => !excludeSet.has(id))
        }
    } else {
        targetIds = variantIds || []
    }

    if (targetIds.length === 0) return { successCount: 0, errorCount: 0, errors: [] }

    // 2. Perform Updates in Chunks
    const CHUNK_SIZE = 200
    let successCount = 0
    let errorCount = 0
    const errors: { id: string; reason: string }[] = []

    for (let i = 0; i < targetIds.length; i += CHUNK_SIZE) {
        const chunk = targetIds.slice(i, i + CHUNK_SIZE)

        const { error } = await supabase
            .from('product_variants')
            .update(updates)
            .in('id', chunk)

        if (error) {
            errorCount += chunk.length
            errors.push({ id: `batch_${i}`, reason: error.message })
        } else {
            successCount += chunk.length
        }
    }

    // 3. Audit Log
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
        admin_id: user?.id,
        action: 'INVENTORY_BULK_UPDATE_VARIANTS',
        resource_type: 'product_variants',
        payload: {
            mode,
            count: targetIds.length,
            fields: Object.keys(updates),
            successCount,
            errorCount
        }
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products/inventory')
    return { successCount, errorCount, errors }
}

/**
 * Bulk update products category.
 */
export async function bulkUpdateProductsCategory(params: {
    mode: 'MANUAL' | 'ALL_MATCHING'
    variantIds?: string[]
    excludedIds?: string[]
    filter?: { search?: string; categoryId?: string }
    newCategoryId: string
}): Promise<BulkUpdateResult> {
    await ensureAdmin()
    const supabase = await createClient()

    const { mode, variantIds, excludedIds, filter, newCategoryId } = params
    let targetProductIds: string[] = []

    // 1. Resolve Product IDs
    if (mode === 'ALL_MATCHING') {
        let query = supabase.from('products').select('id')
        if (filter?.search) query = query.ilike('name', `%${filter.search}%`)
        if (filter?.categoryId) query = query.eq('category_id', filter.categoryId)

        const { data, error } = await query
        if (error) throw new Error(error.message)
        targetProductIds = data.map(p => p.id)
    } else {
        // Resolve product_ids from variantIds
        const { data, error } = await supabase
            .from('product_variants')
            .select('product_id')
            .in('id', variantIds || [])

        if (error) throw new Error(error.message)
        targetProductIds = Array.from(new Set(data.filter(v => v.product_id !== null).map(v => v.product_id as string)))
    }

    if (targetProductIds.length === 0) return { successCount: 0, errorCount: 0, errors: [] }

    // 2. Perform Update
    const { error } = await supabase
        .from('products')
        .update({ category_id: newCategoryId })
        .in('id', targetProductIds)

    if (error) throw new Error(error.message)

    // 3. Audit Log
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
        admin_id: user?.id,
        action: 'INVENTORY_BULK_UPDATE_CATEGORY',
        resource_type: 'products',
        payload: { mode, productCount: targetProductIds.length, newCategoryId }
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products/inventory')
    return { successCount: targetProductIds.length, errorCount: 0, errors: [] }
}

/**
 * Bulk update individual variants with different values.
 */
export async function bulkUpdateIndividualVariants(
    updates: { id: string; base_price_cents?: number; stock_count?: number }[]
): Promise<BulkUpdateResult> {
    await ensureAdmin()
    const supabase = await createClient()

    if (updates.length === 0) return { successCount: 0, errorCount: 0, errors: [] }

    const CHUNK_SIZE = 200
    let successCount = 0
    let errorCount = 0
    const errors: { id: string; reason: string }[] = []

    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        const chunk = updates.slice(i, i + CHUNK_SIZE)

        // Supabase doesn't support bulk update with different values in a single .update() call
        // except via RPC or multiple calls. Since we want a transaction-like behavior per chunk,
        // we can use a single .upsert if we have all fields, but we don't.
        // So we'll use Promise.all for the chunk.

        try {
            const results = await Promise.all(chunk.map(u =>
                supabase.from('product_variants').update(u).eq('id', u.id)
            ))

            results.forEach((res, idx) => {
                if (res.error) {
                    errorCount++
                    errors.push({ id: chunk[idx].id, reason: res.error.message })
                } else {
                    successCount++
                }
            })
        } catch (e: any) {
            errorCount += chunk.length
            errors.push({ id: `batch_${i}`, reason: e.message })
        }
    }

    // Audit
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
        admin_id: user?.id,
        action: 'INVENTORY_INDIVIDUAL_BULK_UPDATE',
        resource_type: 'product_variants',
        payload: { count: updates.length, successCount, errorCount }
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products/inventory')
    return { successCount, errorCount, errors }
}
