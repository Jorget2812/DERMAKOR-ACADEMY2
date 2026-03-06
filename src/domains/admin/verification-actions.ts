'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'


/**
 * List all pending verification requests.
 */
export async function getPendingVerifications() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
}


/**
 * Approve a verification request.
 * Creates an auth user and a profile.
 */
export async function approveVerification(requestId: string) {
    await ensureAdmin()
    const supabase = await createClient()

    // 1. Get the request data
    const { data: request, error: fetchError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchError || !request) throw new Error("Request not found")

    // 2. Check if profile already exists for this email
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', request.email)
        .single()

    if (existingProfile) {
        throw new Error("Un profil avec cet email existe déjà.")
    }

    // 3. Create Auth User (Invite)
    // We use the service role key for this to bypass RLS/limitations if needed, 
    // but ensureAdmin already verified we are safe.
    const { data: authUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(request.email, {
        data: {
            full_name: request.full_name,
            company_name: request.company_name
        }
    })

    if (authError) throw new Error(`Auth Error: ${authError.message}`)

    // 4. Update request status
    await supabase
        .from('verification_requests')
        .update({
            status: 'APPROVED',
            processed_at: new Date().toISOString()
        })
        .eq('id', requestId)

    // Profile is created via DB trigger usually, but if not, we ensure it here or rely on the trigger.
    // Our schema usually handles this via auth.users -> public.profiles trigger.

    // 5. Explicitly set level and status on profile (the trigger might default to PENDING)
    await supabase
        .from('profiles')
        .update({
            verification_status: 'APPROVED',
            status: 'ACTIVE',
            level: 'NONE',
            full_name: request.full_name,
            company_name: request.company_name,
            phone_pro: request.phone_pro
        })
        .eq('id', authUser.user.id)

    // 6. Audit Log
    await supabase.from('audit_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'APPROVE_VERIFICATION',
        resource_type: 'verification_requests',
        resource_id: requestId,
        payload: { email: request.email, user_id: authUser.user.id }
    })


    revalidatePath('/admin/verifications')
    return { success: true }
}

/**
 * Reject a verification request.
 */
export async function rejectVerification(requestId: string, reason: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('verification_requests')
        .update({
            status: 'REJECTED',
            admin_notes: reason,
            processed_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if (error) throw new Error(error.message)

    // Audit Log
    await supabase.from('audit_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'REJECT_VERIFICATION',
        resource_type: 'verification_requests',
        resource_id: requestId,
        payload: { reason }
    })


    revalidatePath('/admin/verifications')
    return { success: true }
}
