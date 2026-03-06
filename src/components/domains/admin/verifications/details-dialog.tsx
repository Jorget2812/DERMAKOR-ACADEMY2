'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { approveVerification, rejectVerification } from '@/domains/admin/admin-actions'

import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function VerificationDetailsDialog({ request }: { request: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(false)

    async function handleApprove() {
        setLoading(true)
        try {
            await approveVerification(request.id)
            toast.success("Candidat approuvé et invitation envoyée.")
            setOpen(false)
        } catch (e: any) {
            toast.error(e.message || "Erreur lors de l'approbation")
        } finally {
            setLoading(false)
        }
    }

    async function handleReject() {
        if (!rejectReason) return toast.error("Veuillez indiquer une raison.")
        setLoading(true)
        try {
            await rejectVerification(request.id, rejectReason)
            toast.success("Candidature rejetée.")
            setOpen(false)
        } catch (e: any) {
            toast.error(e.message || "Erreur lors du rejet")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" /> Détails
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Détails de la demande</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                    <DetailItem label="Nom" value={request.full_name} />
                    <DetailItem label="Email" value={request.email} />
                    <DetailItem label="Entreprise" value={request.company_name} />
                    <DetailItem label="IDE / TVA" value={request.ide_situation || 'Non fourni'} />
                    <DetailItem label="Expertise" value={request.expertise_domain} />
                    <DetailItem label="Téléphone" value={request.phone_pro} />
                    <div className="col-span-2">
                        <DetailItem label="Adresse" value={request.address_pro} />
                    </div>
                </div>

                {showRejectForm && (
                    <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-100">
                        <Label htmlFor="reason" className="text-red-900">Raison du rejet</Label>
                        <Input
                            id="reason"
                            placeholder="Ex: Document non valide, hors zone..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {!showRejectForm ? (
                        <>
                            <Button
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={() => setShowRejectForm(true)}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Rejeter
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleApprove}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Approuver & Créer Compte
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setShowRejectForm(false)}>Annuler</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirmer le rejet"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
            <p className="text-sm font-medium">{value}</p>
        </div>
    )
}
