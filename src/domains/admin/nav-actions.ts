'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NavItemStyle = 'normal' | 'outline' | 'button_gold' | 'button_outline'

export interface NavItem {
    id: string
    label_fr: string
    label_de: string | null
    label_it: string | null
    link: string | null
    display_order: number
    is_visible: boolean
    is_dropdown: boolean
    style: NavItemStyle
    parent_id: string | null
    icon: string | null
    open_in_new_tab: boolean
    created_at?: string
    updated_at?: string
}

export interface SiteSetting {
    key: string
    value: any
    updated_at?: string
}

/**
 * Get all navigation items, hierarchical or flat.
 * For the header, we usually want top-level items with their children.
 */
export async function getNavItems() {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
        .from('nav_items')
        .select('*')
        .order('display_order', { ascending: true })

    if (error) {
        console.error('[getNavItems] Error:', error)
        return []
    }

    return data as NavItem[]
}

/**
 * Get site settings as a key-value record.
 */
export async function getSiteSettings() {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
        .from('site_settings')
        .select('key, value')

    if (error) {
        console.error('[getSiteSettings] Error:', error)
        return {} as Record<string, any>
    }

    const settings: Record<string, any> = {}
    data.forEach((item: any) => {
        // value is JSONB, so item.value is already parsed if it was valid JSON
        settings[item.key] = item.value
    })

    return settings
}

/**
 * Admin: Upsert nav item
 */
export async function upsertNavItem(item: Partial<NavItem>) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: user.id })
    if (!isAdmin) throw new Error("Forbidden")

    if (!item.label_fr) {
        throw new Error("Le label français est obligatoire")
    }

    const { data, error } = await (supabase as any)
        .from('nav_items')
        .upsert(item)
        .select()
        .single()

    if (error) {
        console.error('[upsertNavItem] Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    return data as NavItem
}

/**
 * Admin: Delete nav item
 */
export async function deleteNavItem(id: string) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: user.id })
    if (!isAdmin) throw new Error("Forbidden")

    const { error } = await (supabase as any)
        .from('nav_items')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('[deleteNavItem] Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

/**
 * Admin: Update site settings
 */
export async function updateSiteSetting(key: string, value: any) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: user.id })
    if (!isAdmin) throw new Error("Forbidden")

    const { error } = await (supabase as any)
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) {
        console.error('[updateSiteSetting] Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

/**
 * Admin: Reorder items
 */
export async function reorderNavItems(items: { id: string, display_order: number }[]) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: user.id })
    if (!isAdmin) throw new Error("Forbidden")

    const { error } = await (supabase as any)
        .from('nav_items')
        .upsert(items)

    if (error) {
        console.error('[reorderNavItems] Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
