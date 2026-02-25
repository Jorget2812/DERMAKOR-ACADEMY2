import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from 'next/navigation'

import { ShoppingBag, GraduationCap, Package, Clock, ShieldCheck, Zap } from 'lucide-react'
import { Link } from '@/navigation'
import { getUserStats } from '@/domains/commerce/actions'
import { Badge } from '@/components/ui/badge'
import { getDashboardSettings } from '@/domains/admin/cms-actions'


export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const stats = await getUserStats()
    const isPremium = profile?.level === 'PREMIUM'

    // Load dynamic CMS content
    const cms = await getDashboardSettings(profile?.level || 'NONE', 'fr')

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif">Bienvenue, {profile?.full_name}</h1>
                    <p className="text-muted-foreground mt-1">Votre espace professionnel DermaKor Swiss.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isPremium ? (
                        <Badge className="bg-amber-100 text-amber-900 border border-amber-200/50 py-1.5 px-4 rounded-full flex items-center gap-2 uppercase tracking-wider text-[10px] font-bold">
                            <ShieldCheck size={14} className="text-amber-600" /> Partenaire Premium
                        </Badge>
                    ) : (
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-100 py-1.5 px-4 rounded-full flex items-center gap-2 uppercase tracking-wider text-[10px] font-bold">
                            Partenaire Standard
                        </Badge>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Commandes" value={stats.orderCount.toString()} icon={Package} />
                <StatsCard title="Cours terminés" value={stats.completedLessons.toString()} icon={GraduationCap} />
                <StatsCard title="Remise" value={isPremium ? "50%" : "30%"} icon={Zap} accent />
                <StatsCard title="Status" value="ACTIF" icon={Clock} />
            </div>

            {/* Dynamic Hero Section */}
            {cms?.enabled ? (
                <Card
                    className="border-none shadow-xl overflow-hidden relative"
                    style={{
                        backgroundColor: cms.hero_bg_color || '#0F172A',
                        color: cms.hero_title_color || '#FFFFFF'
                    }}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShoppingBag size={120} />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-serif mb-2" style={{ color: cms.hero_title_color || '#FFFFFF' }}>
                                {cms.hero_title}
                            </h2>
                            <p className="text-sm mb-6 leading-relaxed" style={{ color: cms.hero_body_color || '#94A3B8' }}>
                                {cms.hero_body}
                            </p>
                            <div className="flex gap-4">
                                <Link href={cms.hero_cta_href || "/app/shop"}>
                                    <Button className="bg-accent hover:bg-white hover:text-accent border-none text-white transition-all">
                                        {cms.hero_cta_label}
                                    </Button>
                                </Link>
                                {!isPremium && (
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase text-[10px] tracking-widest">
                                        Devenir Premium
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShoppingBag size={120} />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-serif mb-2">
                                {isPremium ? "Privilèges Premium Activés" : "Avantages de votre compte Standard"}
                            </h2>
                            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                {isPremium
                                    ? "En tant que partenaire Premium, vous bénéficiez d'une remise de 50% sur tout le catalogue et d'un accès prioritaire aux nouveaux protocoles techniques."
                                    : "Votre compte Standard vous donne droit à 30% de remise sur vos commandes et l'accès à la formation de base Dermakor."}
                            </p>
                            <div className="flex gap-4">
                                <Link href="/app/shop">
                                    <Button className="bg-accent hover:bg-white hover:text-accent border-none text-white transition-all">
                                        Commander en boutique
                                    </Button>
                                </Link>
                                {!isPremium && (
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase text-[10px] tracking-widest">
                                        Devenir Premium
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Dynamic Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                {cms?.card1_title ? (
                    <QuickLink
                        title={cms.card1_title}
                        description={cms.card1_body || ""}
                        href={cms.card1_cta_href || "/app/shop"}
                        icon={getIcon(cms.card1_icon) || ShoppingBag}
                    />
                ) : (
                    <QuickLink
                        title="Boutique Professionnelle"
                        description="Prix partenaires et gestion de stock simplifiée."
                        href="/app/shop"
                        icon={ShoppingBag}
                    />
                )}

                {cms?.card2_title ? (
                    <QuickLink
                        title={cms.card2_title}
                        description={cms.card2_body || ""}
                        href={cms.card2_cta_href || "/app/academy"}
                        icon={getIcon(cms.card2_icon) || GraduationCap}
                    />
                ) : (
                    <QuickLink
                        title="Académie de Formation"
                        description="Protocoles de soin et certificats de formation."
                        href="/app/academy"
                        icon={GraduationCap}
                    />
                )}
            </div>
        </div>
    )
}

import * as Icons from 'lucide-react'

function getIcon(name: string | null | undefined) {
    if (!name) return null
    // @ts-ignore
    return Icons[name] || null
}

function StatsCard({ title, value, icon: Icon, accent }: { title: string, value: string, icon: any, accent?: boolean }) {
    return (
        <Card className={`border-none shadow-sm ${accent ? 'bg-accent/10 border border-accent/20' : 'bg-white border border-slate-100'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-xs font-medium uppercase tracking-wider ${accent ? 'text-accent' : 'text-muted-foreground'}`}>{title}</CardTitle>
                <Icon size={16} className={accent ? 'text-accent' : 'text-slate-400'} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
            </CardContent>
        </Card>
    )
}

function QuickLink({ title, description, href, icon: Icon }: { title: string, description: string, href: string, icon: any }) {
    return (
        <Link href={href} className="block group">
            <Card className="h-full border-border/50 hover:border-accent transition-all duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors">
                        <Icon size={24} />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )
}

import { Button } from "@/components/ui/button"
