import { getSiteSettings, updateSiteSetting } from '@/domains/admin/settings-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Settings,
    Globe,
    CreditCard,
    Palette,
    Save,
    Info,
    CheckCircle2,
    Building2,
    FileText
} from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { getAdminPaymentSettings } from '@/domains/commerce/bank-actions'
import { Link } from '@/navigation'
import { ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
    const rawSettings = await getSiteSettings()

    // Map keys to objects for easier access
    const settingsMap = rawSettings.reduce((acc: any, s: any) => {
        acc[s.key] = s.value
        return acc
    }, {})

    const bankSettings = await getAdminPaymentSettings()

    // Server Action within the component for simple updates
    async function handleSave(formData: FormData) {
        'use server'
        const key = formData.get('key') as string
        const fields = Array.from(formData.entries())
            .filter(([k]) => k !== 'key')
            .reduce((acc: any, [k, v]) => {
                // Try to parse numbers if appropriate
                const val = v as string
                acc[k] = isNaN(Number(val)) || val === '' ? val : Number(val)
                return acc
            }, {})

        await updateSiteSetting(key, fields)
        revalidatePath('/[locale]/(admin)/admin/settings', 'layout')
    }


    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-primary">Paramètres Système</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-light uppercase tracking-widest">Configuration globale de la plateforme Dermakor.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-bold tracking-widest border border-green-100">
                    <CheckCircle2 size={12} /> CONFIGURATION ACTIVE
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* 1. ACADEMY INFO */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-4 p-8">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-accent">
                            <Globe size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-serif">Informations Académie</CardTitle>
                            <CardDescription className="text-xs uppercase tracking-wider font-light mt-1">Identité et contacts de l'établissement</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={handleSave} className="space-y-6">
                            <input type="hidden" name="key" value="academy_info" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom de l'Académie</Label>
                                    <Input name="name" defaultValue={settingsMap.academy_info?.name} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Contact</Label>
                                    <Input name="contact_email" defaultValue={settingsMap.academy_info?.contact_email} className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Téléphone Support</Label>
                                    <Input name="support_phone" defaultValue={settingsMap.academy_info?.support_phone} className="h-11 rounded-xl" />
                                </div>
                            </div>
                            <Button className="bg-accent hover:bg-accent/90 text-white rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20">
                                <Save size={14} className="mr-2" /> Enregistrer les infos
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* 2. COMMERCE CONFIG */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <div className="flex items-center gap-4 mb-2">
                            <CreditCard size={20} className="text-blue-600" />
                            <CardTitle className="text-lg font-serif">Commerce & TVA</CardTitle>
                        </div>
                        <CardDescription className="text-[10px] uppercase tracking-wider">Règles fiscales et expédition</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={handleSave} className="space-y-6">
                            <input type="hidden" name="key" value="commerce_config" />
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">TVA par défaut (%)</Label>
                                    <Input name="default_vat" type="number" step="0.1" defaultValue={settingsMap.commerce_config?.default_vat} className="h-11 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Livraison Gratuite (CHF)</Label>
                                    <Input name="free_shipping_threshold" type="number" defaultValue={settingsMap.commerce_config?.free_shipping_threshold} className="h-11 rounded-xl font-bold" />
                                </div>
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-[10px] text-blue-800 flex gap-3">
                                    <Info size={14} className="shrink-0" />
                                    <p className="leading-relaxed">Ces valeurs influencent le calcul automatique du panier pour los clientes non-premium.</p>
                                </div>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200">
                                <Save size={14} className="mr-2" /> Enregistrer
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* 2.5 BANK CONFIG (Dedicated Page Link) */}
                <Card className="lg:col-span-3 border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/admin/settings/payments" className="block">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-4 p-8">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <Building2 size={24} />
                            </div>
                            <div className="flex-grow">
                                <CardTitle className="text-xl font-serif">Modes de Paiement</CardTitle>
                                <CardDescription className="text-xs uppercase tracking-wider font-light mt-1">Configurez le virement bancaire et les options de règlement</CardDescription>
                            </div>
                            <Button variant="ghost" className="rounded-xl h-10 w-10 p-0 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all">
                                <ChevronRight size={20} />
                            </Button>
                        </CardHeader>
                    </Link>
                </Card>

                {/* 2.6 INVOICING CONFIG (Dedicated Page Link) */}
                <Card className="lg:col-span-3 border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/admin/settings/invoicing" className="block">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-4 p-8">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <div className="flex-grow">
                                <CardTitle className="text-xl font-serif">Facturation & PDF</CardTitle>
                                <CardDescription className="text-xs uppercase tracking-wider font-light mt-1">Éditez les coordonnées de l'entreprise et les mentions légales des factures</CardDescription>
                            </div>
                            <Button variant="ghost" className="rounded-xl h-10 w-10 p-0 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all">
                                <ChevronRight size={20} />
                            </Button>
                        </CardHeader>
                    </Link>
                </Card>

                {/* 3. BRANDING */}
                <Card className="lg:col-span-3 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-4 p-8">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600">
                            <Palette size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-serif">Branding & Design</CardTitle>
                            <CardDescription className="text-xs uppercase tracking-wider font-light mt-1">Personnalisation visuelle du portail</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={handleSave} className="flex flex-col md:flex-row gap-8 items-start">
                            <input type="hidden" name="key" value="branding" />
                            <div className="w-full md:w-1/3 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Couleur Primaire</Label>
                                    <div className="flex gap-3">
                                        <Input name="primary_color" defaultValue={settingsMap.branding?.primary_color} className="h-11 rounded-xl font-mono" />
                                        <div className="w-11 h-11 rounded-xl border border-slate-200 shadow-inner" style={{ backgroundColor: settingsMap.branding?.primary_color || '#D4AF37' }} />
                                    </div>
                                </div>
                                <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 font-bold uppercase tracking-widest text-[10px]">
                                    Appliquer le Style
                                </Button>
                            </div>
                            <div className="flex-grow p-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                    <Settings size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Logo de l'Académie</p>
                                    <p className="text-[10px] text-slate-400 uppercase mt-1">Format PNG o SVG, fond transparent</p>
                                </div>
                                <Button variant="outline" type="button" className="rounded-xl h-9 text-[10px] font-bold border-slate-200">
                                    Changer le Logo
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
