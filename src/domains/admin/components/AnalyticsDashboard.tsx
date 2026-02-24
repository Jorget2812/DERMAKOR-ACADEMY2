'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, ExternalLink, ArrowUpRight, DollarSign } from 'lucide-react'

interface AnalyticsDashboardProps {
    stats: {
        topProducts: any[]
        monthlyGrowth: { month: string, sales: number, users: number }[]
        salesGrowth: string
        newPros: number
        averageBasket: string
    }
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
    const maxSales = Math.max(...stats.monthlyGrowth.map(m => m.sales), 1)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Croissance Ventes</span>
                            <div className="bg-green-50 text-green-600 p-1 rounded-full"><TrendingUp size={12} /></div>
                        </div>
                        <div className="text-2xl font-bold font-serif">
                            {Number(stats.salesGrowth) > 0 ? '+' : ''}{stats.salesGrowth}%
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Comparé au mois dernier</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nouveaux Pros</span>
                            <div className="bg-blue-50 text-blue-600 p-1 rounded-full"><Users size={12} /></div>
                        </div>
                        <div className="text-2xl font-bold font-serif">+{stats.newPros}</div>
                        <p className="text-[10px] text-slate-400 mt-1">Nouveaux approuvés ce mois</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Valeur Panier</span>
                            <div className="bg-amber-50 text-amber-600 p-1 rounded-full"><DollarSign size={12} /></div>
                        </div>
                        <div className="text-2xl font-bold font-serif">{stats.averageBasket} CHF</div>
                        <p className="text-[10px] text-slate-400 mt-1">Panier moyen (Période)</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-accent/5 border border-accent/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Status Système</span>
                            <div className="bg-accent/10 text-accent p-1 rounded-full"><ArrowUpRight size={12} /></div>
                        </div>
                        <div className="text-2xl font-bold font-serif text-accent">OPTIMAL</div>
                        <p className="text-[10px] text-accent/60 mt-1">Données temps réel</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart (Custom CSS) */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 px-6 py-5">
                        <CardTitle className="text-lg font-serif">Performance Mensuelle</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-64 flex items-end justify-between gap-4">
                            {stats.monthlyGrowth.map((m, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="relative w-full flex items-end justify-center h-full">
                                        <div
                                            className="w-full max-w-[40px] bg-slate-100 group-hover:bg-accent transition-all duration-300 rounded-t-lg"
                                            style={{ height: `${(m.sales / maxSales) * 100}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {m.sales} CHF
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 px-6 py-5">
                        <CardTitle className="text-lg font-serif">Top Produits</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {stats.topProducts.map((p: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{p.name || 'Produit Inconnu'}</span>
                                        <span className="text-[10px] text-slate-400">{p.quantity} unités vendues</span>
                                    </div>
                                    <span className="text-xs font-bold font-mono">
                                        {(p.total_price_cents / 100).toLocaleString('fr-CH')} CHF
                                    </span>
                                </div>
                            ))}
                            {stats.topProducts.length === 0 && (
                                <div className="p-12 text-center text-slate-400 text-xs italic">
                                    Aucune donnée de vente.
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-50">
                            <button className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors">
                                Voir tout le rapport <ExternalLink size={12} />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
