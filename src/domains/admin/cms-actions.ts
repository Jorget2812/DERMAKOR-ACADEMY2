'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { auditLog } from '../admin/admin-actions'

export type UserLevel = 'NONE' | 'STANDARD' | 'PREMIUM'
export type Locale = 'fr' | 'it' | 'de'

export interface ProductBadge {
    id?: string
    product_id: string
    level: UserLevel
    locale: Locale
    badge_text: string
    enabled: boolean
}

export interface DashboardSettings {
    id?: string
    level: UserLevel
    locale: Locale
    enabled: boolean
    hero_title?: string
    hero_body?: string
    hero_cta_label?: string
    hero_cta_href?: string
    hero_bg_color?: string
    hero_title_color?: string
    hero_body_color?: string
    card1_title?: string
    card1_body?: string
    card1_icon?: string
    card1_cta_label?: string
    card1_cta_href?: string
    card2_title?: string
    card2_body?: string
    card2_icon?: string
    card2_cta_label?: string
    card2_cta_href?: string
}

/**
 * Upsert product badge
 */
export async function upsertProductBadge(badge: ProductBadge) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) throw new Error("Accès refusé")

    const { data, error } = await supabase
        .from('product_badges')
        .upsert(badge)
        .select()
        .single()

    if (error) throw new Error(error.message)

    // Audit Log
    await auditLog('PRODUCT_BADGE_UPDATE', 'product_badges', data.id, badge)

    revalidatePath('/[locale]/(app)/app/shop', 'layout')
    return { success: true, data }
}

/**
 * Get badges for a specific product
 */
export async function getProductBadges(productId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('product_badges')
        .select('*')
        .eq('product_id', productId)

    if (error) throw new Error(error.message)
    return data as ProductBadge[]
}

/**
 * Upsert dashboard settings
 */
export async function upsertDashboardSettings(settings: DashboardSettings) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: user.id })
    if (!isAdmin) throw new Error("Accès refusé")

    const { data, error } = await supabase
        .from('dashboard_settings')
        .upsert(settings, { onConflict: 'level,locale' })
        .select()
        .single()

    if (error) {
        console.error("[upsertDashboardSettings] Supabase Error:", error)
        throw new Error(error.message)
    }

    // Audit Log
    await auditLog('DASHBOARD_CONTENT_UPDATE', 'dashboard_settings', data.id, settings)

    revalidatePath('/[locale]/(app)/app', 'layout')
    return { success: true, data }
}

/**
 * Get dashboard settings
 */
export async function getDashboardSettings(level: UserLevel, locale: Locale) {
    const supabase = await createClient()

    // First try precise match
    let { data, error } = await supabase
        .from('dashboard_settings')
        .select('*')
        .eq('level', level)
        .eq('locale', locale)
        .maybeSingle()

    if (error) throw new Error(error.message)

    // Fallback to 'fr' if not found and current is not 'fr'
    if (!data && locale !== 'fr') {
        const { data: fallbackData } = await supabase
            .from('dashboard_settings')
            .select('*')
            .eq('level', level)
            .eq('locale', 'fr')
            .maybeSingle()
        data = fallbackData
    }

    return data as DashboardSettings | null
}
