'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { VerificationRequestSchema, VerificationRequestForm } from './types'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'


/**
 * Public: Professional submits a verification request
 */
export async function submitVerification(data: VerificationRequestForm) {
    const validated = VerificationRequestSchema.safeParse(data)
    if (!validated.success) {
        return { error: "Données invalides" }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('verification_requests')
        .insert([{
            full_name: validated.data.fullName,
            email: validated.data.email,
            phone_personal: validated.data.phonePersonal,
            company_name: validated.data.companyName,
            ide_situation: validated.data.ideSituation,
            phone_pro: validated.data.phonePro,
            expertise_domain: validated.data.expertiseDomain,
            website: validated.data.website,
            address_pro: validated.data.addressPro,
            message: validated.data.message,
            status: 'PENDING'
        }])

    if (error) {
        if (error.code === '23505') return { error: "Une demande avec cet email existe déjà" }
        return { error: "Erreur lors de l'envoi de la demande" }
    }

    return { success: true }
}

/**
 * Admin: Approve a request and invite user
 */
export async function adminApproveUser(requestId: string, initialLevel: 'NONE' | 'STANDARD' | 'PREMIUM') {
    const supabase = await createClient()

    // 1. Check if admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Non autorisé" }

    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) return { error: "Accès refusé" }

    // 2. Get request details
    const { data: request, error: fetchError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchError || !request) return { error: "Demande introuvable" }

    const adminClient = createAdminClient()

    // 3. Create user in Auth (without password/invite)
    const { data: authUser, error: authError } = await adminClient.auth.admin.inviteUserByEmail(request.email, {
        data: { full_name: request.full_name }
    })

    if (authError) return { error: "Erreur lors de l'invitation" }

    // 4. Update request status
    await supabase
        .from('verification_requests')
        .update({
            status: 'APPROVED',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id
        })
        .eq('id', requestId)

    // 5. Profile is created via Trigger (assuming trigger exists) or manual insert
    // Let's do manual insert for robustness in this plan
    const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
            id: authUser.user.id,
            email: request.email,
            full_name: request.full_name,
            verification_status: 'APPROVED' as Database['public']['Enums']['verification_status'],
            status: 'ACTIVE' as Database['public']['Enums']['user_status'],
            level: initialLevel as Database['public']['Enums']['user_level'],
            company_name: request.company_name,
            phone_pro: request.phone_pro
        }])

    if (profileError) {
        console.error("Profile creation error:", profileError)
    }


    revalidatePath('/admin/verifications')
    return { success: true }
}
