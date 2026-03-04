'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { cancelOrder } from '@/domains/commerce/cancel-order-action'
import { toast } from 'sonner'

interface CancelOrderButtonProps {
    orderId: string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
    const router = useRouter()
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleCancel = async () => {
        setLoading(true)
        const result = await cancelOrder(orderId)
        if (result.success) {
            toast.success('Commande annulée avec succès.')
            router.refresh()
        } else {
            toast.error(result.error || 'Erreur lors de l\'annulation.')
        }
        setLoading(false)
        setConfirming(false)
    }

    if (!confirming) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                onClick={() => setConfirming(true)}
            >
                <XCircle size={14} />
                Annuler la commande
            </Button>
        )
    }

    return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700 font-medium flex-1">
                Êtes-vous sûr de vouloir annuler cette commande ?
            </p>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-3"
                    onClick={() => setConfirming(false)}
                    disabled={loading}
                >
                    Non
                </Button>
                <Button
                    size="sm"
                    className="text-xs h-7 px-3 bg-red-600 hover:bg-red-700 text-white gap-1"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Oui, annuler
                </Button>
            </div>
        </div>
    )
}
