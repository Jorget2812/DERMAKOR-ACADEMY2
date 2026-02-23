import { createClient } from '@/lib/supabase/server'
import { updateMonthlyDiscount } from '@/domains/admin/admin-actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Percent, Calendar, ShieldCheck, Tag } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function DiscountsPage() {
    const supabase = await createClient()
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const { data: discounts } = await supabase
        .from('monthly_discounts')
        .select('*')
        .eq('year_month', currentMonth)

    const standardDiscount = discounts?.find(d => d.level === 'STANDARD')?.percent || 0
    const premiumDiscount = discounts?.find(d => d.level === 'PREMIUM')?.percent || 0

    async function handleUpdateAction(formData: FormData) {
        'use server'
        const level = formData.get('level') as 'STANDARD' | 'PREMIUM'
        const percent = parseInt(formData.get('percent') as string)
        const month = formData.get('month') as string

        await updateMonthlyDiscount(month, level, percent)
        revalidatePath('/admin/discounts')
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-serif text-primary">Gestion des Remises</h1>
                <p className="text-muted-foreground mt-1 text-sm font-light">Définissez les remises mensuelles globales pour chaque niveau de partenaire.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* STANDARD DISCOUNTS */}
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-blue-50/50 border-b border-blue-100 flex flex-row items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                                <Tag size={20} />
                            </div>
                            <CardTitle className="text-lg font-serif">Niveau STANDARD</CardTitle>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-none uppercase text-[10px] tracking-widest px-3">Remise Actuelle: {standardDiscount}%</Badge>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <form action={handleUpdateAction} className="space-y-4">
                            <input type="hidden" name="level" value="STANDARD" />
                            <input type="hidden" name="month" value={currentMonth} />
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pourcentage de remise (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                    <input
                                        type="number"
                                        name="percent"
                                        min="0"
                                        max="30"
                                        defaultValue={standardDiscount}
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all outline-none text-lg font-bold"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">Limitée à 30% pour le niveau Standard selon les règles métier.</p>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 font-bold uppercase tracking-widest text-xs h-12">
                                Mettre à jour (Standard)
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* PREMIUM DISCOUNTS */}
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-amber-50/50 border-b border-amber-100 flex flex-row items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-600">
                                <ShieldCheck size={20} />
                            </div>
                            <CardTitle className="text-lg font-serif">Niveau PREMIUM</CardTitle>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-none uppercase text-[10px] tracking-widest px-3">Remise Actuelle: {premiumDiscount}%</Badge>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <form action={handleUpdateAction} className="space-y-4">
                            <input type="hidden" name="level" value="PREMIUM" />
                            <input type="hidden" name="month" value={currentMonth} />
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pourcentage de remise (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                    <input
                                        type="number"
                                        name="percent"
                                        min="0"
                                        max="50"
                                        defaultValue={premiumDiscount}
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-100 transition-all outline-none text-lg font-bold"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">Limitée à 50% pour le niveau Premium selon les règles métier.</p>
                            </div>
                            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200/50 font-bold uppercase tracking-widest text-xs h-12">
                                Mettre à jour (Premium)
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm bg-slate-50 p-6 flex items-center gap-4">
                <Calendar className="text-slate-400" size={24} />
                <div className="flex-grow">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Période Active</p>
                    <p className="text-sm font-medium">{new Date().toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 italic">Toutes les commandes passées ce mois-ci utiliseront ces tarifs.</p>
                </div>
            </Card>
        </div>
    )
}
