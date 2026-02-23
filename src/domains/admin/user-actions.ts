'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'


/**
 * List all users/profiles.
 */
export async function getUsers() {
    await ensureAdmin()
    const supabase = await createClient()

    // Get profiles joined with some stats (mocked stats for now)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

/**
 * Update user level or status.
 */
export async function updateUserProfile(userId: string, updates: {
    level?: 'NONE' | 'STANDARD' | 'PREMIUM',
    status?: 'ACTIVE' | 'SUSPENDED',
    locale?: 'fr' | 'it' | 'de'
}) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

    if (error) throw new Error(error.message)

    // Audit Log
    await supabase.from('audit_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'UPDATE_USER_PROFILE',
        resource_type: 'profiles',
        resource_id: userId,
        payload: { updates }
    })


    revalidatePath('/admin/users')
    return { success: true }
}
