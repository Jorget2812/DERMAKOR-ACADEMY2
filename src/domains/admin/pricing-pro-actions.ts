'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PricingScope = 'GLOBAL' | 'CATEGORY' | 'PRODUCT'

export interface PricingRule {
    id?: string
    year_month: string
    level: 'STANDARD' | 'PREMIUM'
    scope: PricingScope
    category_id?: string | null
    product_id?: string | null
    resale_factor: number
    active: boolean
}

/**
 * Fetch all rules for a month
 */
export async function getPricingRules(yearMonth?: string) {
    const supabase = await createClient()
    let query = supabase.from('pricing_pro_rules').select('*, categories(name), products(name)')

    if (yearMonth) {
        query = query.eq('year_month', yearMonth)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
}

/**
 * Upsert a pricing rule
 */
export async function upsertPricingRule(rule: PricingRule) {
    const supabase = await createClient()

    // Ensure admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Accès non autorisé")
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) throw new Error("Accès admin requis")

    const { data, error } = await supabase
        .from('pricing_pro_rules')
        .upsert(rule)
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/[locale]/(admin)/admin/pricing-pro', 'layout')
    return { success: true, data }
}

/**
 * Delete a rule
 */
export async function deletePricingRule(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('pricing_pro_rules').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/[locale]/(admin)/admin/pricing-pro', 'layout')
    return { success: true }
}

/**
 * Helpers for selectors
 */
export async function getCategoriesForSelector() {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('id, name').order('name')
    return data || []
}

export async function getProductsForSelector() {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('id, name').order('name')
    return data || []
}

/**
 * Preview pricing for a specific product and settings
 */
export async function previewPricing(productId: string, yearMonth: string, level: 'STANDARD' | 'PREMIUM') {
    const supabase = await createClient()

    // 1. Get product and its category
    const { data: product } = await supabase
        .from('products')
        .select('*, categories(id, name), product_variants(*)')
        .eq('id', productId)
        .single()

    if (!product) throw new Error("Produit introuvable")

    // 2. Mocking the logic that will be in RPC later for preview
    // Fetch rules for that month and level
    const { data: rules } = await supabase
        .from('pricing_pro_rules')
        .select('*')
        .eq('year_month', yearMonth)
        .eq('level', level)
        .eq('active', true)

    // Precedencia: PRODUCTO > CATEGORÍA > GLOBAL
    let factor = 1.0

    // For Standard, hardcoded logic exception (Homecare)
    const isHomecare = product.categories?.id && (await checkIfHomecare(product.categories.id))

    // Unified logic: PRODUCT > CATEGORY > GLOBAL for all levels (Standard & Premium)
    const productRule = rules?.find(r => r.scope === 'PRODUCT' && r.product_id === productId)
    const categoryRule = rules?.find(r => r.scope === 'CATEGORY' && r.category_id === product.category_id)
    const globalRule = rules?.find(r => r.scope === 'GLOBAL')

    factor = productRule?.resale_factor ?? categoryRule?.resale_factor ?? globalRule?.resale_factor ?? 1.0

    // Fallback logic for Standard Homecare if no rule exists
    if (!factor && level === 'STANDARD' && isHomecare) {
        factor = 2.5
    }

    if (!factor) factor = 1.0

    const firstVariant = product.product_variants?.[0]
    const basePrice = firstVariant?.base_price_cents || 0
    const netPrice = Math.round(basePrice / factor)

    // VAT Logic: NONE pays 8.1% on net. Pro levels pay 0%.
    const vatRate = 0 // Simulator is for PRO levels
    const vatAmount = 0
    const grossPrice = netPrice

    return {
        productName: product.name,
        basePrice,
        factorUsed: factor,
        netPrice,
        vatRate,
        vatAmount,
        grossPrice
    }
}

async function checkIfHomecare(categoryId: string) {
    const supabase = await createClient()
    const { data: cat } = await supabase.from('categories').select('slug, name').eq('id', categoryId).single()
    return cat?.slug === 'homecare' || cat?.name?.toLowerCase().includes('homecare')
}
