import { Link } from '@/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home, Info, GraduationCap, ShoppingBag, ExternalLink } from 'lucide-react'

const EDITABLE_PAGES = [
    {
        slug: 'home',
        title: 'Page d\'Accueil',
        description: 'Titre hero, sous-titre, boutons CTA, sections de valeurs.',
        href: '/',
        icon: Home,
        color: 'text-accent',
        bg: 'bg-accent/10',
        fields: 5
    },
    {
        slug: 'about',
        title: 'À Propos',
        description: 'Mission, valeurs, chiffres clés et textes de présentation.',
        href: '/about',
        icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        fields: 4
    },
    {
        slug: 'academy-info',
        title: 'Nos Formations',
        description: 'Titres de l\'académie, descriptions des modules, CTA d\'inscription.',
        href: '/academy-info',
        icon: GraduationCap,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        fields: 6
    },
    {
        slug: 'shop',
        title: 'La Boutique',
        description: 'Titre, sous-titre de la boutique publique.',
        href: '/shop',
        icon: ShoppingBag,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        fields: 2
    },
    {
        slug: 'faq',
        title: 'FAQ',
        description: 'Questions et réponses de la foire aux questions.',
        href: '/faq',
        icon: ChevronRight,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        fields: 22
    },
    {
        slug: 'cgv',
        title: 'CGV',
        description: 'Conditions Générales de Vente (Rich Text).',
        href: '/cgv',
        icon: ChevronRight,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        fields: 1
    },
    {
        slug: 'privacy',
        title: 'Confidentialité',
        description: 'Politique de confidentialité (Rich Text).',
        href: '/confidentialite',
        icon: ChevronRight,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        fields: 1
    },
    {
        slug: 'contact',
        title: 'Contact',
        description: 'Titres et informations de la page contact.',
        href: '/contact',
        icon: ChevronRight,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        fields: 6
    },
]

export default function PagesHubPage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-primary">Gestion des Pages</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-light uppercase tracking-widest">
                        Modifiez les textes et contenus de chaque page publique sans toucher au code.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 text-accent rounded-full text-[10px] font-bold tracking-widest border border-accent/20">
                    {EDITABLE_PAGES.length} pages disponibles
                </div>
            </header>

            {/* Info banner */}
            <div className="flex gap-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Info size={16} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-blue-900">Comment ça marche ?</p>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        Sélectionnez une page ci-dessous pour ouvrir son éditeur. Modifiez les champs souhaités et cliquez sur "Enregistrer". Les changements seront visibles immédiatement sur le site public.
                    </p>
                </div>
            </div>

            {/* Page Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {EDITABLE_PAGES.map((page) => (
                    <Card key={page.slug} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <CardHeader className="p-8 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${page.bg} flex items-center justify-center ${page.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <page.icon size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-serif">{page.title}</CardTitle>
                                        <CardDescription className="text-[10px] uppercase tracking-wider mt-1">
                                            {page.fields} champs éditables
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link href={page.href} target="_blank">
                                    <Button variant="ghost" size="sm" className="h-9 gap-2 text-[10px] font-bold text-muted-foreground hover:text-accent">
                                        <ExternalLink size={12} /> Voir
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs">{page.description}</p>
                            <Link href={`/admin/pages/${page.slug}`}>
                                <Button className="bg-slate-900 hover:bg-black rounded-xl h-10 px-6 text-[10px] font-bold uppercase tracking-widest gap-2 group/btn">
                                    Éditer
                                    <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
