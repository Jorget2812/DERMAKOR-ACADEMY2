'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAndUploadInvoice } from '@/lib/invoice-service'

/**
 * Get a signed URL for a client to download their own invoice.
 * Rules:
 *  - User must be authenticated
 *  - Order must belong to the authenticated user
 *  - Order must have status = 'PAID'
 *  - If invoice_pdf_path exists, return a signed URL directly
 *  - If not, generate the PDF first (uses admin client internally), then return URL
 */
export async function getMyInvoiceUrl(
    orderId: string
): Promise<{ url: string | null; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { url: null, error: 'Non authentifié' }

    // Fetch order — RLS ensures user can only read their own orders
    const { data: order, error: fetchErr } = await supabase
        .from('orders')
        .select('id, status, user_id, invoice_pdf_path')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

    if (fetchErr || !order) return { url: null, error: 'Commande introuvable' }
    if (order.status !== 'PAID') {
        return { url: null, error: 'La facture est disponible uniquement pour les commandes payées' }
    }

    let pdfPath = (order as any).invoice_pdf_path as string | null

    // Generate PDF if not yet created
    if (!pdfPath) {
        try {
            const result = await generateAndUploadInvoice(orderId)
            pdfPath = (result as any).path || null
        } catch (err: any) {
            console.error('[getMyInvoiceUrl] PDF generation error:', err.message)
            return { url: null, error: 'Erreur lors de la génération de la facture' }
        }
    }

    if (!pdfPath) return { url: null, error: 'Facture introuvable' }

    // Use admin client for createSignedUrl — storage RLS restricts non-admins.
    // Ownership was already verified above via the user's supabase client.
    const adminSupabase = createAdminClient()
    const { data: urlData, error: urlErr } = await adminSupabase.storage
        .from('invoices')
        .createSignedUrl(pdfPath, 3600)

    if (urlErr || !urlData?.signedUrl) {
        console.error('[getMyInvoiceUrl] createSignedUrl error:', urlErr)
        return { url: null, error: 'Impossible de générer le lien de téléchargement' }
    }

    return { url: urlData.signedUrl }
}
