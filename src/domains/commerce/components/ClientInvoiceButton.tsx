'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { getMyInvoiceUrl } from '@/domains/commerce/my-invoice-action'

interface ClientInvoiceButtonProps {
    orderId: string
    /** Pass the already-known invoice_pdf_path if available (avoids server round-trip) */
    invoicePdfPath?: string | null
    variant?: 'outline' | 'ghost' | 'default'
    size?: 'sm' | 'default'
    label?: string
}

export function ClientInvoiceButton({
    orderId,
    invoicePdfPath,
    variant = 'outline',
    size = 'sm',
    label = 'Facture PDF',
}: ClientInvoiceButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handleDownload() {
        setLoading(true)
        try {
            const { url, error } = await getMyInvoiceUrl(orderId)
            if (error || !url) {
                toast.error(error || 'Impossible de télécharger la facture.')
                return
            }
            window.open(url, '_blank')
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            disabled={loading}
            onClick={handleDownload}
            className="gap-2 border-primary/20 hover:border-primary/50 text-xs"
        >
            {loading
                ? <Loader2 size={14} className="animate-spin" />
                : <FileText size={14} className="text-primary" />
            }
            {loading ? 'Génération...' : label}
        </Button>
    )
}
