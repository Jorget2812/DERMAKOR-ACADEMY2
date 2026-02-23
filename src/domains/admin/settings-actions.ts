'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'

export async function getSiteSettings() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')

    if (error) {
        console.error("Error fetching settings:", error)
        return []
    }
    return data
}

export async function updateSiteSetting(key: string, value: any) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/settings')
    return { success: true }
}
