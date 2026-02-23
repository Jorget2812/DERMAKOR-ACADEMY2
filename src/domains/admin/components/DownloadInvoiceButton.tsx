'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { generateInvoicePDF } from '../order-actions'

interface DownloadInvoiceButtonProps {
    orderId: string
    invoicePath: string | null
}

export function DownloadInvoiceButton({ orderId, invoicePath }: DownloadInvoiceButtonProps) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    async function handleDownload() {
        setLoading(true)
        try {
            let path = invoicePath

            // If no path, trigger generation (backup)
            if (!path) {
                const result = await generateInvoicePDF(orderId)
                if (!result.success) throw new Error("Échec de la génération de la facture")
                path = (result as any).path
            }

            if (!path) throw new Error("Chemin de facture introuvable")

            // Get signed URL
            const { data, error } = await supabase
                .storage
                .from('invoices')
                .createSignedUrl(path, 60)

            if (error) throw error

            window.open(data.signedUrl, '_blank')
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={handleDownload}
            className="h-8 text-slate-500 hover:text-accent hover:bg-accent/5 flex items-center gap-1"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Facture
        </Button>
    )
}
