'use server'

import { createClient } from '@/lib/supabase/server'

export interface ShippingOption {
    method: 'STANDARD' | 'EXPRESS'
    label_fr: string
    price_cents: number
    estimated_days_min: number
    estimated_days_max: number
}

/**
 * Get both Standard and Express shipping options for a given cart weight.
 * Uses RPC so no direct table access — bypasses type-checking pre-migration.
 */
export async function getAvailableShippingRates(weightGrams: number): Promise<{
    standard: ShippingOption | null
    express: ShippingOption | null
}> {
    const supabase = await createClient()
    const safeWeight = Math.max(weightGrams, 1)

    const [stdRes, expRes] = await Promise.all([
        (supabase as any).rpc('get_shipping_rate', { p_weight_grams: safeWeight, p_method: 'STANDARD' }),
        (supabase as any).rpc('get_shipping_rate', { p_weight_grams: safeWeight, p_method: 'EXPRESS' })
    ])

    return {
        standard: (stdRes.data && Array.isArray(stdRes.data) && stdRes.data.length > 0)
            ? (stdRes.data[0] as ShippingOption)
            : null,
        express: (expRes.data && Array.isArray(expRes.data) && expRes.data.length > 0)
            ? (expRes.data[0] as ShippingOption)
            : null,
    }
}

/**
 * Get the minimum Standard shipping rate price (for cart drawer "dès X CHF" display).
 * Direct query is cast to any because shipping_rates isn't in generated types pre-migration.
 */
export async function getMinShippingRate(): Promise<number | null> {
    try {
        const supabase = (await createClient()) as any
        const { data, error } = await supabase
            .from('shipping_rates')
            .select('price_cents')
            .eq('method', 'STANDARD')
            .eq('active', true)
            .order('price_cents', { ascending: true })
            .limit(1)
            .maybeSingle()

        if (error || !data) return null
        return data.price_cents as number
    } catch {
        return null
    }
}
