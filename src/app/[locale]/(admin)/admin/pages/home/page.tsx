import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const PAGE_DEFAULTS: Record<string, string> = {
    hero_title: "L'Élite de la Beauté pour les Professionnels",
    hero_subtitle: "Formations certifiantes et boutique exclusive de produits dermo-esthétiques haute performance. Réservé aux experts.",
    hero_badge: "Expertise Suisse en Dermo-Esthétique",
    cta_primary: "S'inscrire comme Professionnel",
    cta_secondary: "Découvrir la Collection",
    value1_title: "Qualité Suisse",
    value1_desc: "Des standards de fabrication exigeants et des formulations scientifiquement prouvées.",
    value2_title: "Accès Restreint",
    value2_desc: "Une plateforme sécurisée exclusivement dédiée aux instituts et cliniques esthétiques.",
    value3_title: "Académie Masterclass",
    value3_desc: "Apprentissage continu avec des experts internationaux et des protocoles innovants.",
    dual_section_title: "Une double plateforme pour votre croissance",
    boutique_desc: "Commandez vos produits cabine et revente avec des remises échelonnées jusqu'à 50% selon votre statut.",
    academy_desc: "Plus de 20 modules de formation vidéo, supports PDF et quiz pour certifier vos compétences.",
    cta_section_title: "Rejoignez l'élite dermo-esthétique",
    cta_section_subtitle: "Vérification de compte en moins de 24h pour les professionnels suisses éligibles.",
    footer_desc: "Elite Dermo-Esthétique en Suisse. Formations professionnelles et boutique exclusive.",
}

export default async function HomePageEditor() {
    const content = await getPageContents('home', 'fr')

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                            <ArrowLeft size={16} /> Pages
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif text-primary">Page d'Accueil</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Modifiez les textes de la page principale.</p>
                    </div>
                </div>
                <Link href="/" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="home"
                pageName="Page d'Accueil"
                currentContent={content}
                defaultContent={PAGE_DEFAULTS}
                sections={[
                    {
                        title: "🏠 Section Hero (Bannière Principale)",
                        fields: [
                            { key: 'hero_badge', label: 'Badge', type: 'text', description: 'Petit badge au-dessus du titre.', placeholder: PAGE_DEFAULTS.hero_badge },
                            { key: 'hero_title', label: 'Titre Principal', type: 'textarea', description: 'Le grand titre de la page.', placeholder: PAGE_DEFAULTS.hero_title },
                            { key: 'hero_subtitle', label: 'Sous-titre', type: 'textarea', description: 'Le texte descriptif sous le titre.', placeholder: PAGE_DEFAULTS.hero_subtitle },
                            { key: 'cta_primary', label: 'Bouton Principal (CTA)', type: 'text', description: 'Texte du bouton doré.', placeholder: PAGE_DEFAULTS.cta_primary },
                            { key: 'cta_secondary', label: 'Bouton Secondaire', type: 'text', placeholder: PAGE_DEFAULTS.cta_secondary },
                        ]
                    },
                    {
                        title: "⭐ Section Valeurs",
                        fields: [
                            { key: 'value1_title', label: 'Valeur 1 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.value1_title },
                            { key: 'value1_desc', label: 'Valeur 1 — Description', type: 'textarea', placeholder: PAGE_DEFAULTS.value1_desc },
                            { key: 'value2_title', label: 'Valeur 2 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.value2_title },
                            { key: 'value2_desc', label: 'Valeur 2 — Description', type: 'textarea', placeholder: PAGE_DEFAULTS.value2_desc },
                            { key: 'value3_title', label: 'Valeur 3 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.value3_title },
                            { key: 'value3_desc', label: 'Valeur 3 — Description', type: 'textarea', placeholder: PAGE_DEFAULTS.value3_desc },
                        ]
                    },
                    {
                        title: "🛍️ Section Double Expérience",
                        fields: [
                            { key: 'dual_section_title', label: 'Titre de Section', type: 'textarea', placeholder: PAGE_DEFAULTS.dual_section_title },
                            { key: 'boutique_desc', label: 'Description Boutique', type: 'textarea', placeholder: PAGE_DEFAULTS.boutique_desc },
                            { key: 'academy_desc', label: 'Description Académie', type: 'textarea', placeholder: PAGE_DEFAULTS.academy_desc },
                        ]
                    },
                    {
                        title: "🎯 Section Appel à l'Action Final",
                        fields: [
                            { key: 'cta_section_title', label: 'Titre', type: 'text', placeholder: PAGE_DEFAULTS.cta_section_title },
                            { key: 'cta_section_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: PAGE_DEFAULTS.cta_section_subtitle },
                        ]
                    },
                    {
                        title: "📝 Pied de Page (Footer)",
                        fields: [
                            { key: 'footer_desc', label: 'Description Footer', type: 'textarea', placeholder: PAGE_DEFAULTS.footer_desc },
                        ]
                    }
                ]}
            />
        </div>
    )
}
