'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { approveVerification, rejectVerification } from '../admin-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface VerificationButtonsProps {
    requestId: string
}

export function VerificationButtons({ requestId }: VerificationButtonsProps) {
    const [loading, setLoading] = useState<'APPROVE' | 'REJECT' | null>(null)
    const router = useRouter()

    async function handleApprove() {
        setLoading('APPROVE')
        try {
            await approveVerification(requestId)
            toast.success("Demande approuvée con éxito")
            router.refresh()
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(null)
        }
    }

    async function handleReject() {
        const reason = window.prompt("Raison du refus (facultatif):")
        if (reason === null) return // Canceled

        setLoading('REJECT')
        try {
            await rejectVerification(requestId, reason || 'Refusé par l\'administrateur')
            toast.success("Demande rejetée")
            router.refresh()
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
            <Button
                variant="ghost"
                onClick={handleReject}
                disabled={loading !== null}
                className="text-destructive hover:bg-red-50 font-bold uppercase tracking-widest text-[10px]"
            >
                {loading === 'REJECT' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Rejeter
            </Button>
            <Button
                onClick={handleApprove}
                disabled={loading !== null}
                className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 px-8 font-bold uppercase tracking-widest text-[10px]"
            >
                {loading === 'APPROVE' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Approuver
            </Button>
        </div>
    )
}
