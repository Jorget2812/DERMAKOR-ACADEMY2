'use client'

import { useState, useTransition } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import {
    Loader2,
    Save,
    CreditCard,
    Building2,
    User,
    Fingerprint,
    MapPin,
    FileText,
    HelpCircle,
    Eye
} from 'lucide-react'
import { updatePaymentSettings, PaymentSettings } from '@/domains/commerce/bank-actions'

interface PaymentSettingsFormProps {
    initialSettings: PaymentSettings | null
}

export function PaymentSettingsForm({ initialSettings }: PaymentSettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState<PaymentSettings>(initialSettings || {
        is_active: true,
        account_holder: '',
        bank_name: '',
        iban: '',
        swift_bic: '',
        bank_address: '',
        beneficiary_address: '',
        reference_template: 'COMMANDE-{order_id}',
        notes: ''
    })

    const handleChange = (field: keyof PaymentSettings, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    async function handleSave() {
        startTransition(async () => {
            try {
                await updatePaymentSettings(formData)
                toast.success("Paramètres mis à jour avec succès")
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Form Side */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-2xl space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h3 className="font-serif text-lg text-slate-900">Virement Bancaire</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configuration du mode de paiement</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <Checkbox
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => handleChange('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Actif</Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <User size={10} /> Titulaire du compte
                            </Label>
                            <Input
                                value={formData.account_holder}
                                onChange={e => handleChange('account_holder', e.target.value)}
                                placeholder="ex: DERMAKOR ACADEMY SA"
                                className="bg-white border-slate-200 h-11 focus:ring-accent/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <Building2 size={10} /> Nom de la banque
                            </Label>
                            <Input
                                value={formData.bank_name}
                                onChange={e => handleChange('bank_name', e.target.value)}
                                placeholder="ex: PostFinance"
                                className="bg-white border-slate-200 h-11 focus:ring-accent/20 rounded-xl"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <Fingerprint size={10} /> IBAN
                            </Label>
                            <Input
                                value={formData.iban}
                                onChange={e => handleChange('iban', e.target.value)}
                                placeholder="CH00 0000 0000 0000 0000 0"
                                className="bg-white border-slate-200 h-11 focus:ring-accent/20 rounded-xl font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <HelpCircle size={10} /> SWIFT / BIC (Optionnel)
                            </Label>
                            <Input
                                value={formData.swift_bic || ''}
                                onChange={e => handleChange('swift_bic', e.target.value)}
                                placeholder="ex: POSTCHZZ"
                                className="bg-white border-slate-200 h-11 focus:ring-accent/20 rounded-xl font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <FileText size={10} /> Modèle de Référence
                            </Label>
                            <Input
                                value={formData.reference_template || ''}
                                onChange={e => handleChange('reference_template', e.target.value)}
                                placeholder="COMMANDE-{order_id}"
                                className="bg-white border-slate-200 h-11 focus:ring-accent/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <MapPin size={10} /> Adresse de la Banque
                            </Label>
                            <Textarea
                                value={formData.bank_address || ''}
                                onChange={e => handleChange('bank_address', e.target.value)}
                                placeholder="Rue de la Banque 1, 1000 Lausanne"
                                className="bg-white border-slate-200 min-h-[80px] focus:ring-accent/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <MapPin size={10} /> Adresse du Bénéficiaire
                            </Label>
                            <Textarea
                                value={formData.beneficiary_address || ''}
                                onChange={e => handleChange('beneficiary_address', e.target.value)}
                                placeholder="Route du Signal 2, 1018 Lausanne"
                                className="bg-white border-slate-200 min-h-[80px] focus:ring-accent/20 rounded-xl"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <FileText size={10} /> Instructions Additionnelles
                            </Label>
                            <Textarea
                                value={formData.notes || ''}
                                onChange={e => handleChange('notes', e.target.value)}
                                placeholder="Veuillez effectuer le paiement dans les 3 jours..."
                                className="bg-white border-slate-200 min-h-[100px] focus:ring-accent/20 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-[0.2em] text-[10px] h-12 px-8 shadow-lg shadow-accent/20 rounded-xl"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
                            Enregistrer les modifications
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Preview Side */}
            <div className="space-y-6">
                <div className="sticky top-24">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <Eye size={14} className="text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aperçu Checkout</span>
                    </div>

                    <Card className="overflow-hidden border-none shadow-xl bg-white rounded-2xl">
                        <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Récapitulatif de paiement</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-4">
                                <div className="flex items-center gap-3 border-b border-accent/10 pb-3">
                                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-accent font-bold uppercase tracking-widest">Virement Bancaire</p>
                                        <p className="text-sm font-serif text-slate-900">{formData.bank_name || 'Ma Banque'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Bénéficiaire</p>
                                        <p className="text-xs font-medium text-slate-700">{formData.account_holder || 'DERMAKOR ACADEMY'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">IBAN</p>
                                        <p className="text-xs font-mono text-slate-700 break-all">{formData.iban || 'CH00 0000 0000 0000 0000 0'}</p>
                                    </div>
                                    {formData.swift_bic && (
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">SWIFT / BIC</p>
                                            <p className="text-xs font-mono text-slate-700">{formData.swift_bic}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[8px] text-accent font-bold uppercase tracking-tighter">Référence à indiquer</p>
                                        <p className="text-xs font-bold text-accent py-1 px-2 bg-accent/10 rounded inline-block">
                                            {formData.reference_template?.replace('{order_id}', '24901') || 'COMMANDE-24901'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {formData.notes && (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 italic leading-relaxed">
                                    "{formData.notes}"
                                </div>
                            )}

                            <div className="text-[9px] text-center text-slate-400 uppercase tracking-widest pt-2">
                                Votre commande sera validée dès réception des fonds.
                            </div>
                        </div>
                    </Card>

                    <div className="mt-6 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-tighter">
                            Les modifications sont appliquées instantanément aux nouveaux clients.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
