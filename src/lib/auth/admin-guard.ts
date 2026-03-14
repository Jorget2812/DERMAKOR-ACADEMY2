import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'

const log = logger('admin-guard')

/**
 * Server-side check to ensure the current user is an authorized Admin.
 * Throws an error or redirects if not authorized.
 */
export async function ensureAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: isAdmin, error } = await supabase.rpc('is_admin')


    if (error || !isAdmin) {
        log.warn('Admin access denied', { userId: user?.id, error: error?.message })
        redirect('/app') // Redirect to user dashboard if not admin
    }

    return user
}

/**
 * Returns true if the user is an admin, false otherwise.
 * Useful for conditional UI in server components.
 */
export async function checkIsAdmin(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: isAdmin } = await supabase.rpc('is_admin')

    return !!isAdmin
}

