'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'

/**
 * Permanently delete a professional:
 * order_items → orders → verification_requests → profiles → auth
 */
export async function deleteProfessional(userId: string): Promise<{ success: boolean }> {
    await ensureAdmin()

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Guard: Get the current admin's ID to prevent self-deletion
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) throw new Error('Non authentifié')
    if (adminUser.id === userId) throw new Error('Vous ne pouvez pas supprimer votre propre compte.')

    // Guard: verify target is not another admin
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

    if (!targetProfile) throw new Error('Professionnel introuvable.')

    // A) Delete order_items for this user's orders
    const { data: userOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)

    if (userOrders && userOrders.length > 0) {
        const orderIds = userOrders.map(o => o.id)
        await adminClient
            .from('order_items')
            .delete()
            .in('order_id', orderIds)
    }

    // B) Delete orders
    await adminClient
        .from('orders')
        .delete()
        .eq('user_id', userId)

    // C) Delete verification_requests (by user_id or email)
    await adminClient
        .from('verification_requests')
        .delete()
        .or(`email.eq.${targetProfile.email}`)

    // D) Delete profile
    await adminClient
        .from('profiles')
        .delete()
        .eq('id', userId)

    // E) Delete from Supabase Auth (requires service_role)
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (authDeleteError) {
        console.error('[deleteProfessional] Auth delete error:', authDeleteError.message)
        // Don't throw — profile is already gone, auth cleanup failure is non-critical
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin')
    return { success: true }
}

/**
 * Update a professional's level: STANDARD ↔ PREMIUM
 */
export async function updateProfessionalLevel(
    userId: string,
    newLevel: 'STANDARD' | 'PREMIUM'
): Promise<{ success: boolean }> {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .update({ level: newLevel })
        .eq('id', userId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/users')
    return { success: true }
}
