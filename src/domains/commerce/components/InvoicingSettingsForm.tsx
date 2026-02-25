'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Save,
    Loader2,
    Building2,
    Globe,
    FileText,
    Landmark,
    Mail,
    Phone,
    MapPin,
    Eye,
    Info,
    CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { updateInvoiceSettings, type InvoiceSettings } from '@/domains/commerce/invoice-actions'
import { getAdminPaymentSettings } from '@/domains/commerce/bank-actions'

interface InvoicingSettingsFormProps {
    initialSettings: InvoiceSettings | null
}

export function InvoicingSettingsForm({ initialSettings }: InvoicingSettingsFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [paymentData, setPaymentData] = useState<any>(null)
    const [settings, setSettings] = useState<Partial<InvoiceSettings>>(initialSettings || {
        use_payment_data: true,
        company_name: 'DERMAKOR SWISS',
        company_address: '',
        company_city: '',
        company_zip: '',
        company_country: 'CH',
        company_email: '',
        company_phone: '',
        company_vat_number: '',
        bank_account_holder: '',
        bank_name: '',
        iban: '',
        swift_bic: '',
        footer_text: '',
        terms_text: ''
    })

    // Fetch payment settings to mirror them if enabled
    useEffect(() => {
        const fetchPaymentSettings = async () => {
            const data = await getAdminPaymentSettings()
            if (data) setPaymentData(data)
        }
        fetchPaymentSettings()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setSettings(prev => ({ ...prev, [id]: value }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setSettings(prev => ({ ...prev, use_payment_data: checked }))
    }

    const handleSave = async () => {
        setIsPending(true)
        try {
            await updateInvoiceSettings(settings)
            toast.success("Paramètres de facturation mis à jour")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsPending(false)
        }
    }

    // Determine what bank info to show in preview
    const previewBank = settings.use_payment_data && paymentData ? {
        holder: paymentData.account_holder || settings.bank_account_holder,
        bank: paymentData.bank_name || settings.bank_name,
        iban: paymentData.iban || settings.iban,
        swift: paymentData.swift_bic || settings.swift_bic
    } : {
        holder: settings.bank_account_holder,
        bank: settings.bank_name,
        iban: settings.iban,
        swift: settings.swift_bic
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Form Side */}
            <div className="lg:col-span-2 space-y-6">

                {/* Global Toggle */}
                <Card className="p-6 border-none shadow-sm bg-accent/5 border border-accent/10 rounded-2xl">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-primary">Synchronisation des Paiements</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Réutiliser les coordonnées bancaires du checkout</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="use_payment_data" className="text-xs font-bold text-slate-400">DÉSACTIVÉ</Label>
                            <Switch
                                id="use_payment_data"
                                checked={settings.use_payment_data}
                                onCheckedChange={handleSwitchChange}
                            />
                            <Label htmlFor="use_payment_data" className="text-xs font-bold text-accent">ACTIVÉ</Label>
                        </div>
                    </div>
                </Card>

                {/* 1. Empresa Section */}
                <Card className="p-8 border-none shadow-sm bg-white rounded-2xl space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif text-primary">Informations de l'Entreprise</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Identité légale figurant sur l'en-tête</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="company_name" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                Nom de l'entreprise
                            </Label>
                            <Input id="company_name" value={settings.company_name || ''} onChange={handleChange} className="bg-slate-50/50 border-transparent focus:bg-white transition-all rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_vat_number" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                Numéro IDE / TVA
                            </Label>
                            <Input id="company_vat_number" value={settings.company_vat_number || ''} onChange={handleChange} placeholder="CHE-XXX.XXX.XXX" className="bg-slate-50/50 border-transparent focus:bg-white transition-all rounded-xl" />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="company_address" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                Adresse complète
                            </Label>
                            <Input id="company_address" value={settings.company_address || ''} onChange={handleChange} className="bg-slate-50/50 border-transparent focus:bg-white transition-all rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_city" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                Ville
                            </Label>
                            <Input id="company_city" value={settings.company_city || ''} onChange={handleChange} className="bg-slate-50/50 border-transparent focus:bg-white transition-all rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_zip" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                Code Postal
                            </Label>
                            <Input id="company_zip" value={settings.company_zip || ''} onChange={handleChange} className="bg-slate-50/50 border-transparent focus:bg-white transition-all rounded-xl" />
                        </div>
                    </div>
                </Card>

                {/* 2. Banco Section */}
                <Card className={`p-8 border-none shadow-sm bg-white rounded-2xl space-y-8 transition-opacity duration-300 ${settings.use_payment_data ? 'opacity-40 cursor-not-allowed grayscale pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Landmark size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-serif text-primary">Coordonnées Bancaires Manuelles</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Actif uniquement si la synchronisation est désactivée</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="bank_account_holder" className="text-xs font-bold text-slate-500 uppercase">Titulaire</Label>
                            <Input id="bank_account_holder" value={settings.bank_account_holder || ''} onChange={handleChange} disabled={settings.use_payment_data} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_name" className="text-xs font-bold text-slate-500 uppercase">Banque</Label>
                            <Input id="bank_name" value={settings.bank_name || ''} onChange={handleChange} disabled={settings.use_payment_data} className="rounded-xl" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="iban" className="text-xs font-bold text-slate-500 uppercase tracking-widest">IBAN</Label>
                            <Input id="iban" value={settings.iban || ''} onChange={handleChange} disabled={settings.use_payment_data} className="rounded-xl font-mono" />
                        </div>
                    </div>
                </Card>

                {/* 3. Textos Section */}
                <Card className="p-8 border-none shadow-sm bg-white rounded-2xl space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif text-primary">Mention Légales & Notes</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pied de page et conditions de règlement</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="footer_text" className="text-xs font-bold text-slate-500 uppercase">Bas de page (Footer)</Label>
                            <Textarea id="footer_text" value={settings.footer_text || ''} onChange={handleChange} placeholder="Ex: DermaKor Swiss | Switzerland | ide: CHE-XXX..." className="rounded-xl min-h-[80px]" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="terms_text" className="text-xs font-bold text-slate-500 uppercase">Notes / Conditions de Paiement</Label>
                            <Textarea id="terms_text" value={settings.terms_text || ''} onChange={handleChange} placeholder="Ex: Merci pour votre confiance. Paiement à 10 jours." className="rounded-xl min-h-[80px]" />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-[0.2em] text-[10px] h-12 px-8 shadow-lg rounded-xl"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
                            Mettre à jour la plateforme
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Preview Side */}
            <div className="space-y-6 sticky top-8">
                <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
                    <CardHeader className="bg-slate-900 text-white py-4 px-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-serif flex items-center gap-2">
                            <Eye size={14} className="text-accent" /> APERÇU DYNAMIQUE
                        </CardTitle>
                        <span className="text-[9px] bg-slate-800 px-2 py-1 rounded-full text-slate-400 font-mono">DRAFT_1.0</span>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 text-[10px] leading-relaxed">
                        {/* Header Preview */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                            <div className="space-y-1">
                                <p className="font-bold text-[14px] text-primary tracking-tight">{settings.company_name?.toUpperCase() || 'DERMAKOR SWISS'}</p>
                                <p className="text-slate-500 whitespace-pre-line max-w-[140px] leading-tight">
                                    {settings.company_address || 'Ch des Champs-Courbes 1'}
                                    <br />
                                    {settings.company_zip} {settings.company_city}
                                </p>
                                <p className="text-accent font-medium">{settings.company_email}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[18px] font-serif text-primary leading-none">FACTURE</h4>
                                <p className="text-slate-400 mt-1 font-mono">#INV-2024-001</p>
                                <p className="text-slate-400 text-[9px] mt-4 uppercase tracking-tighter">Émis le: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Order Items Table Preview */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-12 border-b border-slate-900 pb-2 text-[9px] font-bold uppercase text-slate-400">
                                <div className="col-span-6">Description</div>
                                <div className="col-span-2 text-center">Qté</div>
                                <div className="col-span-4 text-right">Total (CHF)</div>
                            </div>
                            <div className="grid grid-cols-12 py-2 border-b border-slate-50">
                                <div className="col-span-6 font-medium text-slate-800">Produit Cosmétique Pro X2</div>
                                <div className="col-span-2 text-center text-slate-500">2</div>
                                <div className="col-span-4 text-right font-bold text-slate-900">450.00</div>
                            </div>
                            <div className="grid grid-cols-12 py-2 border-b border-slate-50">
                                <div className="col-span-6 font-medium text-slate-800">Support Technique & Formation</div>
                                <div className="col-span-2 text-center text-slate-500">1</div>
                                <div className="col-span-4 text-right font-bold text-slate-900">120.00</div>
                            </div>
                        </div>

                        {/* Totals Preview */}
                        <div className="space-y-1.5 pt-4">
                            <div className="flex justify-between text-slate-500">
                                <span>Sous-total HT</span>
                                <span>570.00 CHF</span>
                            </div>
                            <div className="flex justify-between text-slate-400 font-medium">
                                <span>TVA (8.1%)</span>
                                <span>46.17 CHF</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-slate-100 text-[14px] font-bold text-primary">
                                <span>TOTAL TTC</span>
                                <span className="text-accent">616.17 CHF</span>
                            </div>
                        </div>

                        {/* Bank Details Area */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                            <p className="font-bold text-primary uppercase tracking-widest text-[8px] flex items-center gap-2">
                                <Landmark size={10} /> Détails pour le virement
                            </p>
                            <div className="space-y-1 font-mono text-[9px] text-slate-600">
                                <p><span className="text-slate-400">Bénéficiaire:</span> {previewBank.holder || '-'}</p>
                                <p><span className="text-slate-400">Banque:</span> {previewBank.bank || '-'}</p>
                                <p><span className="text-slate-400">IBAN:</span> {previewBank.iban || '-'}</p>
                                <p><span className="text-slate-400">Référence:</span> <span className="bg-white px-1 border border-slate-200 text-slate-900 font-bold">#INV-2024-001</span></p>
                            </div>
                        </div>

                        {/* Footer & Legal */}
                        <div className="pt-6 text-center space-y-3 opacity-60">
                            <p className="text-[8px] italic leading-tight text-slate-500">
                                {settings.terms_text || 'Merci pour votre confiance. Paiement à 10 jours.'}
                            </p>
                            <div className="space-y-1">
                                <p className="font-bold uppercase tracking-widest text-[8px] text-primary">{settings.company_name}</p>
                                <p className="text-[8px] whitespace-pre-line text-slate-400">
                                    {settings.footer_text || 'DermaKor Swiss | Switzerland | ide: CHE-XXX.XXX.XXX'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 flex gap-4">
                    <Info size={20} className="text-blue-500 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-blue-900 text-[11px] font-bold">Le saviez-vous ?</p>
                        <p className="text-blue-700/80 text-[10px] leading-relaxed">
                            Les factures pour les partenaires <strong>Standard</strong> et <strong>Premium</strong> sont générées avec une TVA à 0% conformément aux accords B2B.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
