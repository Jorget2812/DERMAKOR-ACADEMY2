import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings2, Filter, AlertCircle, Plus } from 'lucide-react'
import { getPricingRules, getCategoriesForSelector, getProductsForSelector } from '@/domains/admin/pricing-pro-actions'
import PricingRuleForm from '@/domains/admin/components/PricingRuleForm'
import PricingRulesList from '@/domains/admin/components/PricingRulesList'
import PricingPreviewTool from '@/domains/admin/components/PricingPreviewTool'

export default async function PricingProPage({
    searchParams
}: {
    searchParams: { month?: string, level?: string }
}) {
    const params = await searchParams
    const currentMonth = params.month || new Date().toISOString().slice(0, 7)
    const levelFilter = params.level as 'STANDARD' | 'PREMIUM' | undefined

    const rules = await getPricingRules(currentMonth)
    const filteredRules = levelFilter ? rules.filter(r => r.level === levelFilter) : rules

    const categories = await getCategoriesForSelector()
    const products = await getProductsForSelector()

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge variant="outline" className="mb-3 border-accent/30 text-accent uppercase tracking-widest text-[10px] bg-accent/5">
                        Module Avancé
                    </Badge>
                    <h1 className="text-4xl font-serif text-primary">Pricing Pro</h1>
                    <p className="text-muted-foreground mt-2 text-sm font-light max-w-2xl">
                        Gérez les facteurs de reventa (rentabilité) pour les partenaires.
                        Le prix professionnel est calculé comme <span className="font-medium text-primary">Prix Retail / Facteur</span>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <form className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center px-3 gap-2 text-slate-400">
                            <Filter size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Filtres</span>
                        </div>
                        <input
                            type="month"
                            name="month"
                            defaultValue={currentMonth}
                            className="bg-slate-50 border-none rounded-xl text-xs font-bold p-2 outline-none focus:ring-2 focus:ring-accent/20"
                        />
                        <select
                            name="level"
                            defaultValue={levelFilter || ''}
                            className="bg-slate-50 border-none rounded-xl text-xs font-bold p-2 outline-none focus:ring-2 focus:ring-accent/20"
                        >
                            <option value="">Tous les niveaux</option>
                            <option value="STANDARD">Standard</option>
                            <option value="PREMIUM">Premium</option>
                        </select>
                        <button type="submit" className="bg-primary text-white p-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors">
                            Appliquer
                        </button>
                    </form>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Rules Management */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-xl">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/30 p-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                                    <Settings2 size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-serif">Règles Actives</CardTitle>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{currentMonth}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <PricingRulesList rules={filteredRules} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm bg-blue-50/50 p-6">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="text-blue-500 mt-1" size={20} />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900 mb-1">Règle Standard (Homecare)</h4>
                                    <p className="text-xs text-blue-700 leading-relaxed font-light">
                                        Les membres Standard ont un facteur fixe de **2.5** pour la catégorie **Homecare**.
                                        Pour les autres produits, le facteur est toujours de **1.0**.
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-none shadow-sm bg-amber-50/50 p-6">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="text-amber-500 mt-1" size={20} />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 mb-1">Hiérarchie Premium</h4>
                                    <p className="text-xs text-amber-700 leading-relaxed font-light">
                                        Les règles Premium suivent cet ordre de priorité : <br />
                                        **PRODUIT** {'>'} **CATÉGORIE** {'>'} **GLOBAL**.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Sidebar: New Rule & Preview */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
                        <CardHeader className="p-6 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <Plus size={18} className="text-accent" />
                                <CardTitle className="text-lg font-serif">Nouvelle Règle</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <PricingRuleForm
                                categories={categories}
                                products={products || []}
                                defaultMonth={currentMonth}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden">
                        <CardHeader className="p-6 border-b border-white/10">
                            <CardTitle className="text-lg font-serif">Simulateur de Prix</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <PricingPreviewTool
                                products={products || []}
                                currentMonth={currentMonth}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
