'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { auditLog } from '@/domains/admin/admin-actions'

export interface PaymentSettings {
    id?: string
    is_active: boolean
    account_holder: string
    bank_name: string
    iban: string
    swift_bic?: string
    bank_address?: string
    beneficiary_address?: string
    reference_template?: string
    notes?: string
    updated_at?: string
    updated_by?: string
}

/**
 * Admin: Get global payment settings
 */
export async function getAdminPaymentSettings() {
    const supabase = await createClient()
    const { data, error } = await (supabase.from('payment_settings' as any) as any)
        .select('*')
        .maybeSingle()

    if (error) {
        console.error("[getAdminPaymentSettings] Error:", error)
        return null
    }
    return data as PaymentSettings | null
}

/**
 * Admin: Update global payment settings
 */
export async function updatePaymentSettings(settings: Partial<PaymentSettings>) {
    const supabase = await createClient()

    // Verify admin role via server-side check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // Double check admin status
    const { data: isAdmin } = await supabase.rpc('is_admin', { p_uid: user.id })
    if (!isAdmin) throw new Error("Accès refusé")

    const { data: current } = await (supabase.from('payment_settings' as any) as any).select('id').maybeSingle()

    const payload = {
        ...settings,
        updated_at: new Date().toISOString(),
        updated_by: user.id
    }

    let result
    if (current) {
        result = await (supabase.from('payment_settings' as any) as any)
            .update(payload)
            .eq('id', (current as any).id)
            .select()
            .single()
    } else {
        result = await (supabase.from('payment_settings' as any) as any)
            .insert([payload])
            .select()
            .single()
    }

    if (result.error) {
        console.error("[updatePaymentSettings] Error:", result.error)
        throw new Error("Erreur lors de la mise à jour des paramètres de paiement")
    }

    // Audit Log
    await auditLog(
        'PAYMENT_SETTINGS_UPDATE',
        'payment_settings',
        (result.data as any).id,
        { is_active: settings.is_active, bank_name: settings.bank_name }
    )

    revalidatePath('/admin/settings/payments')
    revalidatePath('/admin/settings')
    return { success: true, data: result.data }
}

/**
 * Public/User: Get active bank settings for checkout
 * Only visible to users who can buy (handled by RLS and server logic)
 */
export async function getActivePaymentSettings() {
    const supabase = await createClient()
    const { data, error } = await (supabase.from('payment_settings' as any) as any)
        .select(`
            account_holder,
            bank_name,
            iban,
            swift_bic,
            bank_address,
            beneficiary_address,
            reference_template,
            notes
        `)
        .eq('is_active', true)
        .maybeSingle()

    if (error) {
        console.error("[getActivePaymentSettings] Error:", error)
        return null
    }
    return data
}
