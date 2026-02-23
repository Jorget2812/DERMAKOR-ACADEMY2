import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Users,
    ShoppingBag,
    GraduationCap,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { getAdminDashboardStats, getPendingVerifications } from '@/domains/admin/admin-actions'
import { Link } from '@/navigation'
import { Sparkles, LayoutPanelLeft } from 'lucide-react'

export default async function AdminDashboard() {
    const statsData = await getAdminDashboardStats()
    const pendingRequests = await getPendingVerifications()

    const stats = [
        { title: 'Ventes du Mois', value: `${statsData.monthlySales} CHF`, icon: ShoppingBag, change: '+12.5%', color: 'text-blue-600' },
        { title: 'Professionnels Actifs', value: statsData.activePros, icon: Users, change: '+3 new', color: 'text-green-600' },
        { title: 'Demandes en Attente', value: statsData.pendingVerifications, icon: Clock, change: 'Urgent', color: 'text-amber-600' },
        { title: 'Taux Complétion Académie', value: '78%', icon: GraduationCap, change: '+5%', color: 'text-purple-600' },
    ]

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-serif text-primary">Tableau de bord de gestion</h1>
                <p className="text-muted-foreground mt-1 text-sm font-light">Vue d'ensemble de l'activité Dermakor Academy & Shop.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{stat.title}</CardTitle>
                            <stat.icon size={16} className={stat.color} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-[10px] font-medium mt-1 flex items-center gap-1">
                                <TrendingUp size={10} className="text-green-500" />
                                <span className="text-green-500">{stat.change}</span>
                                <span className="text-slate-400 font-normal">vs mois dernier</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* CMS & Marketing Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/settings/content/dashboard" className="group">
                    <Card className="border-none shadow-sm bg-white overflow-hidden hover:ring-2 hover:ring-accent/20 transition-all">
                        <div className="h-1 bg-accent/40" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={14} className="text-accent" /> Gestion du Contenu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">Personnalisez les messages et les accès du dashboard utilisateur par niveau de partenariat.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/products" className="group">
                    <Card className="border-none shadow-sm bg-white overflow-hidden hover:ring-2 hover:ring-accent/20 transition-all">
                        <div className="h-1 bg-primary/40" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <LayoutPanelLeft size={14} className="text-primary" /> Badges & Marketing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">Configurez des badges exclusifs sur vos productos pour booster les conversions pro.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Verifications */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
                        <div>
                            <CardTitle className="text-lg font-serif">Dernières Demandes de Vérification</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Nouveaux professionnels en attente d'approbation</p>
                        </div>
                        {pendingRequests.length > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 uppercase text-[9px]">Action Requise</Badge>}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {pendingRequests.slice(0, 5).map((req) => (
                                <VerificationRow
                                    key={req.id}
                                    name={req.full_name}
                                    clinic={req.company_name}
                                    date={req.created_at ? new Date(req.created_at).toLocaleDateString('fr-CH') : 'N/A'}
                                    type={req.expertise_domain || "Professionnel"}
                                />
                            ))}
                            {pendingRequests.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground italic text-sm">
                                    Aucune demande en attente.
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50/50 text-center">
                            <button className="text-[11px] font-bold uppercase tracking-wider text-accent hover:underline">Voir toutes les demandes</button>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health / Quick Info */}
                <div className="space-y-8">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <div className="h-2 bg-accent/20" />
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle size={14} className="text-accent" /> Rappels Stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <StockAlert item="Crème Pro-Age v2" stock={5} />
                            <StockAlert item="Sérum Éclat Suisse" stock={2} />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-green-500" /> Commandes du Jour
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground mt-1">Total: 0.00 CHF net</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function VerificationRow({ name, clinic, date, type }: { name: string, clinic: string, date: string, type: string }) {
    return (
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{name}</span>
                    <span className="text-[10px] text-muted-foreground">{clinic} • {type}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-[10px] text-slate-400 block mb-1">{date}</span>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 text-[9px]">PENDING</Badge>
            </div>
        </div>
    )
}

function StockAlert({ item, stock }: { item: string, stock: number }) {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 border border-red-100 text-[11px]">
            <span className="font-medium text-red-900">{item}</span>
            <span className="font-bold text-red-600">Stock: {stock}</span>
        </div>
    )
}
