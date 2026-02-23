'use client'

import {
    MoreHorizontal,
    Eye,
    FileText,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Download,
    Loader2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { generateInvoicePDF, markOrderPaid, cancelOrder } from '@/domains/admin/order-actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from '@/navigation'

interface OrderActionsMenuProps {
    orderId: string
    invoicePath: string | null
    status: string | null
}

export function OrderActionsMenu({ orderId, invoicePath, status }: OrderActionsMenuProps) {
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    async function handleGenerateInvoice() {
        setLoading(true)
        try {
            const result = await generateInvoicePDF(orderId)
            if (result.success) {
                toast.success("Facture générée avec succès")
            }
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    async function handleMarkPaid() {
        setActionLoading('paid')
        try {
            await markOrderPaid(orderId)
            toast.success("Commande marquée comme payée")
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleCancel() {
        if (!confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return
        setActionLoading('cancel')
        try {
            await cancelOrder(orderId)
            toast.success("Commande annulée")
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleDownload() {
        if (!invoicePath) {
            toast.info("Génération de la facture avant téléchargement...")
            await handleGenerateInvoice()
            return
        }

        try {
            const { data, error } = await supabase
                .storage
                .from('invoices')
                .createSignedUrl(invoicePath, 60)

            if (error) throw error
            window.open(data.signedUrl, '_blank')
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 p-2">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1.5">Actions de commande</DropdownMenuLabel>

                <DropdownMenuItem
                    onClick={() => router.push(`/admin/orders/${orderId}`)}
                    className="rounded-lg cursor-pointer flex items-center gap-2 text-sm"
                >
                    <Eye size={14} className="text-slate-400" /> Ver détails
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-50 my-1" />

                {invoicePath ? (
                    <DropdownMenuItem
                        onClick={handleDownload}
                        className="rounded-lg cursor-pointer flex items-center gap-2 text-sm text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                    >
                        <Download size={14} /> Télécharger la facture
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        onClick={handleGenerateInvoice}
                        disabled={loading}
                        className="rounded-lg cursor-pointer flex items-center gap-2 text-sm text-accent focus:text-accent focus:bg-accent/5"
                    >
                        {loading ? <RefreshCcw size={14} className="animate-spin" /> : <FileText size={14} />}
                        Générer la facture PDF
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-slate-50 my-1" />

                <DropdownMenuItem
                    disabled={status === 'PAID' || actionLoading === 'paid'}
                    onClick={handleMarkPaid}
                    className="rounded-lg cursor-pointer flex items-center gap-2 text-sm"
                >
                    {actionLoading === 'paid' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} className="text-slate-400" />}
                    Marquer como pagado
                </DropdownMenuItem>

                <DropdownMenuItem
                    disabled={status === 'CANCELLED' || actionLoading === 'cancel'}
                    onClick={handleCancel}
                    className="rounded-lg cursor-pointer flex items-center gap-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50"
                >
                    {actionLoading === 'cancel' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Annuler la commande
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}
