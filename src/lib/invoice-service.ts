import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createAdminClient } from './supabase/admin'

export async function generateAndUploadInvoice(orderId: string) {
    const supabase = createAdminClient()

    // 1. Fetch deep order data, invoice settings, and payment settings
    const [orderRes, invoiceSettingsRes, paymentSettingsRes] = await Promise.all([
        supabase
            .from('orders')
            .select(`
                *,
                profiles (*),
                order_items (
                    *,
                    product_variants (
                        sku,
                        products (name)
                    )
                )
            `)
            .eq('id', orderId)
            .single(),
        supabase
            .from('invoice_settings' as any)
            .select('*')
            .maybeSingle(),
        supabase
            .from('payment_settings' as any)
            .select('*')
            .maybeSingle()
    ])

    const { data: order, error: fetchError } = orderRes
    const iSettings = invoiceSettingsRes.data as any
    const pSettings = paymentSettingsRes.data as any

    if (fetchError || !order) throw new Error("Erreur lors de la récupération de la commande")

    // Generate PDF

    // Determine Company Info (Prioritize DB Settings)
    const companyName = iSettings?.company_name || "DERMAKOR SWISS"
    const companyAddress = iSettings?.company_address || ""
    const companyCity = iSettings?.company_city || ""
    const companyZip = iSettings?.company_zip || ""
    const companyEmail = iSettings?.company_email || ""
    const companyVat = iSettings?.company_vat_number || ""

    // Determine Bank Info (Mirror logic)
    const bankDetails = (iSettings?.use_payment_data && pSettings) ? {
        holder: pSettings.account_holder || iSettings.bank_account_holder,
        name: pSettings.bank_name || iSettings.bank_name,
        iban: pSettings.iban || iSettings.iban,
        swift: pSettings.swift_bic || iSettings.swift_bic
    } : {
        holder: iSettings?.bank_account_holder,
        name: iSettings?.bank_name,
        iban: iSettings?.iban,
        swift: iSettings?.swift_bic
    }

    const termsText = iSettings?.terms_text || "Merci pour votre confiance. Paiement sous 10 jours."
    const invoiceNotes = iSettings?.invoice_notes || ""

    // Profile info
    const profile = (order as any).profiles

    // 2. Create PDF with pdf-lib
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    const page = pdfDoc.addPage([595.28, 841.89]) // A4
    const { width, height } = page.getSize()

    const gold = rgb(0.78, 0.64, 0.3) // #c8a34c
    const dark = rgb(0.1, 0.1, 0.1)
    const gray = rgb(0.4, 0.4, 0.4)

    // Header Branding
    page.drawText(companyName.toUpperCase(), { x: 50, y: height - 50, size: 20, font: boldFont, color: gold })
    page.drawText("B2B Aesthetic Platform | Switzerland", { x: 50, y: height - 70, size: 10, font, color: dark })
    page.drawLine({ start: { x: 50, y: height - 85 }, end: { x: width - 50, y: height - 85 }, thickness: 1, color: gold })

    // Invoice Header Info
    const invoiceNum = order.invoice_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`
    const orderDate = order.created_at ? new Date(order.created_at) : new Date()

    page.drawText(`FACTURE: ${invoiceNum}`, { x: 50, y: height - 110, size: 14, font: boldFont })
    page.drawText(`Date: ${orderDate.toLocaleDateString('fr-CH')}`, { x: 50, y: height - 125, size: 9, font })
    page.drawText(`Ref: #${order.id.substring(0, 8).toUpperCase()}`, { x: 50, y: height - 135, size: 9, font })

    // Customer Info
    page.drawText("DESTINATAIRE:", { x: 350, y: height - 110, size: 10, font: boldFont })
    page.drawText(profile?.full_name || '', { x: 350, y: height - 125, size: 9, font })
    page.drawText(profile?.company_name || '', { x: 350, y: height - 135, size: 9, font })
    const shipping = order.shipping_address as any
    page.drawText(`${shipping?.street || ''}`, { x: 350, y: height - 145, size: 9, font })
    page.drawText(`${shipping?.postalCode || ''} ${shipping?.city || ''}, ${shipping?.country || ''}`, { x: 350, y: height - 155, size: 9, font })

    // Table Header
    let currentY = height - 200
    page.drawRectangle({ x: 50, y: currentY - 5, width: width - 100, height: 20, color: gold })
    page.drawText("Produit", { x: 60, y: currentY, size: 9, font: boldFont, color: rgb(1, 1, 1) })
    page.drawText("Qté", { x: 300, y: currentY, size: 9, font: boldFont, color: rgb(1, 1, 1) })
    page.drawText("Unit TTC (CHF)", { x: 370, y: currentY, size: 9, font: boldFont, color: rgb(1, 1, 1) })
    page.drawText("Total TTC (CHF)", { x: 480, y: currentY, size: 9, font: boldFont, color: rgb(1, 1, 1) })

    // Table Body
    currentY -= 25
    for (const item of order.order_items) {
        const name = (item.product_variants?.products?.name || item.product_variants?.sku || 'Produit').substring(0, 40)
        // Definitive Rule: Order uses snapshot. We display gross_unit_price (TTC) in these columns.
        const unitPriceTTC = item.gross_unit_price_cents / 100
        const lineTotalTTC = item.line_total_cents / 100

        page.drawText(name, { x: 60, y: currentY, size: 8, font })
        page.drawText(item.qty.toString(), { x: 305, y: currentY, size: 8, font })
        page.drawText(unitPriceTTC.toFixed(2), { x: 385, y: currentY, size: 8, font })
        page.drawText(lineTotalTTC.toFixed(2), { x: 485, y: currentY, size: 8, font: boldFont })

        currentY -= 15
        if (currentY < 150) break
    }

    // Totals Section
    currentY -= 20
    page.drawLine({ start: { x: 350, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 0.5, color: dark })

    currentY -= 15
    page.drawText("Sous-total (net):", { x: 350, y: currentY, size: 9, font })
    page.drawText(`${(order.total_base_cents / 100).toFixed(2)} CHF`, { x: 485, y: currentY, size: 9, font })

    currentY -= 12
    page.drawText("TVA (8.1%):", { x: 350, y: currentY, size: 9, font })
    page.drawText(`${(order.vat_total_cents / 100).toFixed(2)} CHF`, { x: 485, y: currentY, size: 9, font })

    currentY -= 20
    page.drawText("TOTAL À PAYER (TTC):", { x: 350, y: currentY, size: 11, font: boldFont, color: gold })
    page.drawText(`${(order.total_final_cents / 100).toFixed(2)} CHF`, { x: 485, y: currentY, size: 11, font: boldFont, color: gold })

    // Bank Details Section
    if (bankDetails.iban) {
        currentY -= 50
        page.drawText("DÉTAILS DU RÈGLEMENT:", { x: 50, y: currentY, size: 9, font: boldFont })
        currentY -= 12
        page.drawText(`Titulaire: ${bankDetails.holder || companyName}`, { x: 50, y: currentY, size: 8, font })
        currentY -= 10
        page.drawText(`Banque: ${bankDetails.name || ''}`, { x: 50, y: currentY, size: 8, font })
        currentY -= 10
        page.drawText(`IBAN: ${bankDetails.iban}`, { x: 50, y: currentY, size: 8, font })
        if (bankDetails.swift) {
            currentY -= 10
            page.drawText(`SWIFT/BIC: ${bankDetails.swift}`, { x: 50, y: currentY, size: 8, font })
        }
        currentY -= 15
        page.drawText(`RÉFÉRENCE À INDIQUER: ${invoiceNum}`, { x: 50, y: currentY, size: 9, font: boldFont })
    }

    // Terms / Notes Section
    if (termsText || invoiceNotes) {
        currentY -= 40
        if (invoiceNotes) {
            page.drawText("NOTES:", { x: 50, y: currentY, size: 8, font: boldFont, color: gray })
            currentY -= 10
            page.drawText(invoiceNotes.substring(0, 500), { x: 50, y: currentY, size: 7, font: italicFont, color: gray })
            currentY -= 20
        }
        page.drawText(termsText.replace("{invoice_number}", invoiceNum), { x: 50, y: currentY, size: 8, font, color: dark })
    }

    // Standard Footer
    const companyInfoStr = `${companyName} ${companyVat ? `| IDE: ${companyVat}` : ''} | ${companyEmail || ''}`
    page.drawText(companyInfoStr, { x: width / 2 - 100, y: 30, size: 7, font, color: gray, opacity: 0.8 })

    if (companyAddress) {
        const addrStr = `${companyAddress}, ${companyZip} ${companyCity}`
        page.drawText(addrStr, { x: width / 2 - 100, y: 20, size: 7, font, color: gray, opacity: 0.8 })
    }

    // 3. Save and Upload
    const pdfBytes = await pdfDoc.save()
    const fileName = `${orderId}_invoice.pdf`
    const filePath = `invoices/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, pdfBytes, {
            contentType: 'application/pdf',
            upsert: true
        })

    if (uploadError) throw new Error(`Upload Error: ${uploadError.message}`)

    // 4. Update order row with snapshot data if missing
    const updateData: any = {
        invoice_pdf_path: filePath,
        invoice_generated_at: new Date().toISOString()
    }

    if (!order.invoice_number) {
        const year = new Date().getFullYear()
        const shortId = order.id.substring(0, 6).toUpperCase()
        updateData.invoice_number = `INV-${year}-${shortId}`
    }

    await supabase.from('orders').update(updateData).eq('id', orderId)

    return {
        success: true,
        path: filePath,
        invoice_number: order.invoice_number || updateData.invoice_number
    }
}
