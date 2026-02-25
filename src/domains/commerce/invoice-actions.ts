'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { auditLog } from '../admin/admin-actions'

export type InvoiceSettings = {
    id: string
    use_payment_data: boolean
    company_name: string
    company_address: string
    company_city: string | null
    company_zip: string | null
    company_country: string
    company_vat_number: string | null
    company_email: string | null
    company_phone: string | null
    logo_url: string | null
    bank_account_holder: string | null
    bank_name: string | null
    iban: string | null
    swift_bic: string | null
    footer_text: string | null
    terms_text: string | null
    updated_at: string
}

export async function getAdminInvoiceSettings() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error, status, statusText } = await supabase
        .from('invoice_settings' as any)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("[getAdminInvoiceSettings] Full Error Object:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            status,
            statusText
        })
        return null
    }

    // Fallback default row if none exists (shouldn't happen with migration but for robustness)
    if (!data) {
        return {
            company_name: 'DERMAKOR SWISS',
            company_address: '',
            company_city: '',
            company_zip: '',
            company_country: 'CH',
            use_payment_data: true
        } as any
    }

    return data as unknown as InvoiceSettings
}

export async function updateInvoiceSettings(settings: Partial<InvoiceSettings>) {
    await ensureAdmin()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const { data, error } = await (supabase.from('invoice_settings' as any) as any)
        .upsert({
            ...settings,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error("[updateInvoiceSettings] Error:", error)
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
    }

    // Audit Log
    await auditLog(
        'INVOICE_SETTINGS_UPDATE',
        'invoice_settings',
        data.id,
        { company_name: settings.company_name }
    )

    revalidatePath('/admin/settings/invoicing')
    revalidatePath('/admin/orders')

    return { success: true, data }
}
