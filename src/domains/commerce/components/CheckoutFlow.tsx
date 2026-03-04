'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck,
    CreditCard,
    CheckCircle2,
    Building2,
    ArrowRight,
    ArrowLeft,
    QrCode,
    Copy,
    Check,
    Info,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CartItem, OrderInput } from '../types'
import { createBankTransferOrder } from '../actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ShippingOption } from '../shipping-actions'

interface CheckoutFlowProps {
    items: CartItem[]
    subtotal: number       // HT sum of product prices
    vatAmount: number      // 8.1% of subtotal
    onComplete: () => void
    bankDetails: {
        bank_name: string
        iban: string
        swift_bic?: string
        account_holder: string
        bank_address?: string
        beneficiary_address?: string
        reference_template?: string
        notes?: string
    } | null
    shippingOptions: {
        standard: ShippingOption | null
        express: ShippingOption | null
    }
    totalWeightGrams: number
}

type Step = 'SHIPPING' | 'METHOD' | 'PAYMENT' | 'INSTRUCTIONS'

export function CheckoutFlow({
    items, subtotal, vatAmount, onComplete, bankDetails,
    shippingOptions, totalWeightGrams
}: CheckoutFlowProps) {
    const [step, setStep] = useState<Step>('SHIPPING')
    const [loading, setLoading] = useState(false)
    const [orderRef, setOrderRef] = useState<string | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [selectedMethod, setSelectedMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD')

    const [shipping, setShipping] = useState<OrderInput['shippingAddress']>({
        fullName: '', street: '', city: '', postalCode: '', country: 'CH', phone: ''
    })

    const selectedShipping = selectedMethod === 'STANDARD' ? shippingOptions.standard : shippingOptions.express
    const shippingPrice = (selectedShipping?.price_cents ?? 0) / 100
    const totalCHF = subtotal + vatAmount + shippingPrice

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
        toast.success("Copié dans le presse-papier")
    }

    const handleNextFromAddress = () => {
        if (!shipping.fullName || !shipping.street || !shipping.city || !shipping.postalCode) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }
        setStep('METHOD')
    }

    const handleConfirmOrder = async () => {
        setLoading(true)
        try {
            const result = await createBankTransferOrder(
                items,
                { shippingAddress: { ...shipping, country: 'CH' } },
                selectedMethod
            )
            if (result.success) {
                setOrderRef(result.reference)
                setStep('INSTRUCTIONS')
            }
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { id: 'SHIPPING', title: 'Adresse', icon: <Truck size={14} /> },
        { id: 'METHOD', title: 'Livraison', icon: <Zap size={14} /> },
        { id: 'PAYMENT', title: 'Paiement', icon: <CreditCard size={14} /> },
        { id: 'INSTRUCTIONS', title: 'Confirmation', icon: <CheckCircle2 size={14} /> }
    ]

    const inputCls = "h-12 rounded-xl border-slate-200 focus:ring-1 focus:ring-accent/30 focus:border-accent"

    return (
        <div className="max-w-4xl mx-auto w-full px-4 py-8">
            {/* Steps Progress */}
            <div className="flex items-center justify-between mb-12">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.id}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                step === s.id ? "bg-accent text-white shadow-lg shadow-accent/20" :
                                    steps.findIndex(x => x.id === step) > idx ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                            )}>
                                {steps.findIndex(x => x.id === step) > idx ? <Check size={18} /> : s.icon}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                step === s.id ? "text-primary" : "text-slate-400"
                            )}>{s.title}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 h-[2px] bg-slate-100 mx-4 -mt-6">
                                <motion.div
                                    className="h-full bg-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: steps.findIndex(x => x.id === step) > idx ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Main Flow */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: SHIPPING ADDRESS */}
                        {step === 'SHIPPING' && (
                            <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-serif">Adresse de Livraison</h2>
                                    <p className="text-sm text-muted-foreground font-light">Où souhaitez-vous recevoir votre commande ?</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom Complet</Label>
                                        <Input value={shipping.fullName} onChange={e => setShipping({ ...shipping, fullName: e.target.value })} className={inputCls} placeholder="Jean Dupont" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Adresse</Label>
                                        <Input value={shipping.street} onChange={e => setShipping({ ...shipping, street: e.target.value })} className={inputCls} placeholder="Rue de l'Académie 15" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Code Postal</Label>
                                        <Input value={shipping.postalCode} onChange={e => setShipping({ ...shipping, postalCode: e.target.value })} className={inputCls} placeholder="1000" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ville</Label>
                                        <Input value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} className={inputCls} placeholder="Lausanne" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Téléphone</Label>
                                        <Input value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} className={inputCls} placeholder="+41 79 000 00 00" />
                                    </div>
                                </div>
                                <Button onClick={handleNextFromAddress} className="w-full h-14 rounded-2xl bg-primary hover:bg-black text-white font-bold uppercase tracking-widest text-[11px] shadow-xl group transition-all">
                                    Suivant <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 2: SHIPPING METHOD */}
                        {step === 'METHOD' && (
                            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-4">
                                    <button onClick={() => setStep('SHIPPING')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:text-primary transition-colors">
                                        <ArrowLeft size={12} /> Retour
                                    </button>
                                    <h2 className="text-2xl font-serif">Méthode de Livraison</h2>
                                    <p className="text-[11px] text-slate-400">
                                        Poids total du colis: <span className="font-bold text-primary">{totalWeightGrams >= 1000 ? `${(totalWeightGrams / 1000).toFixed(1)} kg` : `${totalWeightGrams} g`}</span>
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {/* STANDARD option */}
                                    {shippingOptions.standard ? (
                                        <button
                                            onClick={() => setSelectedMethod('STANDARD')}
                                            className={cn(
                                                "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
                                                selectedMethod === 'STANDARD'
                                                    ? "border-accent bg-accent/5 shadow-md shadow-accent/10"
                                                    : "border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", selectedMethod === 'STANDARD' ? "bg-accent text-white" : "bg-slate-100 text-slate-400")}>
                                                        <Truck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-primary">{shippingOptions.standard.label_fr}</p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">
                                                            {shippingOptions.standard.estimated_days_min}–{shippingOptions.standard.estimated_days_max} jours ouvrables
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">CHF {(shippingOptions.standard.price_cents / 100).toFixed(2)}</p>
                                                    {selectedMethod === 'STANDARD' && <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Sélectionné</span>}
                                                </div>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 opacity-50">
                                            <p className="text-sm text-slate-500 text-center">Standard — Non disponible pour ce poids</p>
                                        </div>
                                    )}

                                    {/* EXPRESS option */}
                                    {shippingOptions.express ? (
                                        <button
                                            onClick={() => setSelectedMethod('EXPRESS')}
                                            className={cn(
                                                "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
                                                selectedMethod === 'EXPRESS'
                                                    ? "border-accent bg-accent/5 shadow-md shadow-accent/10"
                                                    : "border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", selectedMethod === 'EXPRESS' ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-500")}>
                                                        <Zap size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-primary">{shippingOptions.express.label_fr}</p>
                                                        <p className="text-[10px] text-amber-600 mt-0.5 uppercase tracking-widest font-bold">⚡ Prioritaire</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">CHF {(shippingOptions.express.price_cents / 100).toFixed(2)}</p>
                                                    {selectedMethod === 'EXPRESS' && <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Sélectionné</span>}
                                                </div>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 opacity-50">
                                            <p className="text-sm text-slate-500 text-center">Express — Non disponible pour ce poids</p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={() => setStep('PAYMENT')}
                                    disabled={!selectedShipping}
                                    className="w-full h-14 rounded-2xl bg-primary hover:bg-black text-white font-bold uppercase tracking-widest text-[11px] shadow-xl group transition-all"
                                >
                                    Confirmer la méthode <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 3: PAYMENT */}
                        {step === 'PAYMENT' && (
                            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="space-y-4">
                                    <button onClick={() => setStep('METHOD')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:text-primary transition-colors">
                                        <ArrowLeft size={12} /> Retour
                                    </button>
                                    <h2 className="text-2xl font-serif">Méthode de Paiement</h2>
                                    <p className="text-sm text-muted-foreground font-light">Nous utilisons exclusivement le virement bancaire pour garantir la sécurité de vos transactions professionnelles.</p>
                                </div>
                                <div className="relative p-8 rounded-3xl border-2 border-accent bg-accent/5 flex items-center gap-6 overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700"><Building2 size={120} /></div>
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-accent"><Building2 size={32} /></div>
                                    <div>
                                        <h3 className="text-lg font-bold">Virement Bancaire</h3>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Transaction Sécurisée</p>
                                    </div>
                                    <div className="ml-auto w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                </div>
                                <Button onClick={handleConfirmOrder} disabled={loading} className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-accent/20">
                                    {loading ? "Création de la commande..." : "Confirmer la commande"} <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 4: INSTRUCTIONS */}
                        {step === 'INSTRUCTIONS' && (
                            <motion.div key="instructions" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                                    <h2 className="text-3xl font-serif">Commande Enregistrée</h2>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">Votre commande <span className="font-bold text-primary tracking-widest">{orderRef}</span> est en attente de paiement.</p>
                                </div>
                                <Card className="border-none bg-slate-50/50 rounded-[32px] overflow-hidden">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex items-center gap-3 mb-4"><Building2 size={20} className="text-accent" /><h3 className="text-xs font-bold uppercase tracking-widest">Coordonnées de paiement</h3></div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { label: 'Bénéficiaire', value: bankDetails?.account_holder, field: 'holder' },
                                                { label: 'Adresse Bénéficiaire', value: bankDetails?.beneficiary_address, field: 'beneficiary_address' },
                                                { label: 'IBAN', value: bankDetails?.iban, field: 'iban' },
                                                { label: 'SWIFT / BIC', value: bankDetails?.swift_bic, field: 'swift' },
                                                { label: 'Banque', value: bankDetails?.bank_name, field: 'bank' },
                                                { label: 'Adresse Banque', value: bankDetails?.bank_address, field: 'bank_address' },
                                                { label: 'Référence de paiement', value: orderRef, field: 'ref' }
                                            ].filter(item => item.value).map((item) => (
                                                <div key={item.label} className="flex flex-col gap-1 p-4 bg-white rounded-2xl border border-slate-100 group transition-all hover:shadow-sm">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                                                    <div className="flex items-center justify-between">
                                                        <span className={cn("text-sm font-medium", item.field === 'iban' || item.field === 'ref' ? "font-mono" : "", (item.field === 'bank_address' || item.field === 'beneficiary_address') ? "text-[10px] leading-tight" : "")}>
                                                            {item.value || '---'}
                                                        </span>
                                                        <button onClick={() => item.value && copyToClipboard(item.value, item.field)} className="text-slate-300 hover:text-accent transition-colors">
                                                            {copiedField === item.field ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 flex items-start gap-4">
                                            <QrCode size={40} className="text-accent shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Paiement Instantané</p>
                                                <p className="text-[11px] text-slate-600 leading-relaxed font-light">Utilisez l'application de votre banque pour scanner les coordonnées et effectuer le virement en quelques secondes.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Button onClick={onComplete} className="w-full h-14 rounded-2xl bg-primary hover:bg-black text-white font-bold uppercase tracking-widest text-[11px]">
                                    Retour à la boutique
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none bg-slate-50/50 rounded-[32px] overflow-hidden sticky top-8">
                        <CardHeader className="p-8 border-b border-white/50">
                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} className="text-slate-400" /> Récapitulatif
                            </h3>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-[8px] font-bold text-slate-300">NO IMG</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Qté: {item.qty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-6 border-t border-white/50 space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 font-light">
                                    <span>Sous-total (HT)</span>
                                    <span>CHF {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 font-light">
                                    <span>TVA (8.1%)</span>
                                    <span>CHF {vatAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 font-light">
                                    <span>
                                        {selectedMethod === 'STANDARD' ? 'Livraison Standard' : 'Livraison Express'}
                                    </span>
                                    <span>{selectedShipping ? `CHF ${shippingPrice.toFixed(2)}` : '—'}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 text-primary border-t border-white/50">
                                    <span className="text-xs font-bold uppercase tracking-widest">Total (TTC)</span>
                                    <span className="text-xl font-serif">CHF {totalCHF.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {step !== 'INSTRUCTIONS' && (
                        <div className="p-6 bg-slate-900 rounded-[28px] text-white space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-accent">
                                <CheckCircle2 size={12} /> Transaction Protégée
                            </div>
                            <p className="text-[10px] font-light text-slate-400 leading-relaxed uppercase tracking-widest">
                                Vos données sont cryptées par SSL et traitées avec les plus hauts standards de sécurité bancaire suisse.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
