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
            phone_pro: validated.data.phonePro,
            company_name: validated.data.companyName,
            ide_situation: validated.data.ideSituation,
            ide_number: validated.data.ideNumber || null,
            expertise_domain: validated.data.professionalType || '',
            address_pro: validated.data.addressPro,
            canton: validated.data.canton,
            professional_type: validated.data.professionalType,
            request_object: validated.data.requestObject,
            website: validated.data.website || null,
            message: validated.data.message || null,
            status: 'PENDING'
        }])

    if (error) {
        console.error('[submitVerification] DB Error:', error)
        if (error.code === '23505') return { error: "Une demande avec cet email existe déjà" }
        return { error: "Erreur lors de l'envoi de la demande" }
    }

    // 2. Send webhook to n8n with ALL fields
    const n8nWebhookUrl = "https://jorge2812.app.n8n.cloud/webhook/1c994d86-492b-407a-bca3-018303d13921"

    try {
        fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'registration_submitted',
                fullName: validated.data.fullName,
                email: validated.data.email,
                phonePro: validated.data.phonePro,
                companyName: validated.data.companyName,
                professionalType: validated.data.professionalType,
                ideSituation: validated.data.ideSituation,
                ideNumber: validated.data.ideNumber || null,
                addressPro: validated.data.addressPro,
                canton: validated.data.canton,
                website: validated.data.website || null,
                requestObject: validated.data.requestObject,
                message: validated.data.message || null,
                submittedAt: new Date().toISOString()
            })
        }).catch(err => console.error("[n8n Webhook Error]:", err))
    } catch (e) {
        console.error("[n8n Trigger Error]:", e)
    }

    return { success: true, email: validated.data.email }
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

    // 5. Profile is created via Trigger or manual insert
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
