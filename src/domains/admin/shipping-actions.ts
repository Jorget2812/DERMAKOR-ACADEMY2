'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface ShippingRate {
    id: string
    method: 'STANDARD' | 'EXPRESS'
    label_fr: string
    label_de: string | null
    label_it: string | null
    weight_min_grams: number
    weight_max_grams: number
    price_cents: number
    estimated_days_min: number
    estimated_days_max: number
    active: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

export type ShippingRateInput = Omit<ShippingRate, 'id' | 'created_at' | 'updated_at'>

async function verifyAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'ADMIN') throw new Error('Accès refusé')
    return createAdminClient()
}

export async function getShippingRates(): Promise<ShippingRate[]> {
    // Uses admin client to bypass RLS (admin sees all rows including inactive)
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .order('sort_order', { ascending: true })

    if (error) {
        console.error('[getShippingRates]', error)
        return []
    }
    return (data || []) as ShippingRate[]
}

export async function createShippingRate(input: ShippingRateInput): Promise<ShippingRate> {
    const supabase = (await verifyAdmin()) as any
    const { data, error } = await supabase
        .from('shipping_rates')
        .insert(input)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data as ShippingRate
}

export async function updateShippingRate(id: string, input: Partial<ShippingRateInput>): Promise<ShippingRate> {
    const supabase = (await verifyAdmin()) as any
    const { data, error } = await supabase
        .from('shipping_rates')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data as ShippingRate
}

export async function deleteShippingRate(id: string): Promise<void> {
    const supabase = (await verifyAdmin()) as any
    const { error } = await supabase
        .from('shipping_rates')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
}

export async function toggleShippingRate(id: string, active: boolean): Promise<void> {
    const supabase = (await verifyAdmin()) as any
    const { error } = await supabase
        .from('shipping_rates')
        .update({ active })
        .eq('id', id)

    if (error) throw new Error(error.message)
}
