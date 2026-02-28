import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const PAGE_DEFAULTS: Record<string, string> = {
    page_title: "L'Excellence à la Source",
    page_subtitle: "DERMAKOR SWISS est le partenaire privilégié des professionnels de la dermo-esthétique en Suisse.",
    mission_title: "Notre Mission",
    mission_text1: "Née d'une volonté de standardiser l'excellence dans les soins esthétiques avancés, notre académie offre bien plus que des produits.",
    mission_text2: "Basés en Suisse, nous nous engageons à respecter les standards de qualité les plus élevés.",
    stat1_value: "100%",
    stat1_label: "Expertise Suisse",
    stat2_value: "500+",
    stat2_label: "Partenaires Certifiés",
    value1_title: "Rigueur Scientifique",
    value1_desc: "Toutes nos formations et produits sont validés par des protocoles cliniques stricts.",
    value2_title: "Exclusivité B2B",
    value2_desc: "Nous protégeons nos partenaires en réservant nos produits et tarifs aux seuls experts vérifiés.",
    value3_title: "Communauté d'Experts",
    value3_desc: "Rejoignez un réseau de professionnels passionnés par l'innovation esthétique.",
    cta_title: "Prêt à transformer votre pratique ?",
    cta_button: "Rejoindre l'Académie",
    about_image: "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=1000",
}

export default async function AboutPageEditor() {
    const content = await getPageContents('about', 'fr')

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
                        <h1 className="text-3xl font-serif text-primary">Page À Propos</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Modifiez la présentation et les valeurs de l'académie.</p>
                    </div>
                </div>
                <Link href="/about" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="about"
                pageName="À Propos"
                currentContent={content}
                defaultContent={PAGE_DEFAULTS}
                sections={[
                    {
                        title: "🏆 En-tête de Page",
                        fields: [
                            { key: 'page_title', label: 'Titre Principal', type: 'text', placeholder: PAGE_DEFAULTS.page_title },
                            { key: 'page_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: PAGE_DEFAULTS.page_subtitle },
                        ]
                    },
                    {
                        title: "🎯 Section Mission",
                        fields: [
                            { key: 'mission_title', label: 'Titre Colonne Gauche', type: 'text', placeholder: PAGE_DEFAULTS.mission_title },
                            { key: 'mission_text1', label: 'Paragraphe 1', type: 'textarea', placeholder: PAGE_DEFAULTS.mission_text1 },
                            { key: 'mission_text2', label: 'Paragraphe 2', type: 'textarea', placeholder: PAGE_DEFAULTS.mission_text2 },
                            { key: 'about_image', label: 'Image Illustration', type: 'image', placeholder: PAGE_DEFAULTS.about_image },
                        ]
                    },
                    {
                        title: "📊 Statistiques Clés",
                        fields: [
                            { key: 'stat1_value', label: 'Chiffre 1', type: 'text', placeholder: PAGE_DEFAULTS.stat1_value },
                            { key: 'stat1_label', label: 'Étiquette 1', type: 'text', placeholder: PAGE_DEFAULTS.stat1_label },
                            { key: 'stat2_value', label: 'Chiffre 2', type: 'text', placeholder: PAGE_DEFAULTS.stat2_value },
                            { key: 'stat2_label', label: 'Étiquette 2', type: 'text', placeholder: PAGE_DEFAULTS.stat2_label },
                        ]
                    },
                    {
                        title: "⭐ Nos Valeurs",
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
                        title: "📣 Appel à l'Action",
                        fields: [
                            { key: 'cta_title', label: 'Titre', type: 'text', placeholder: PAGE_DEFAULTS.cta_title },
                            { key: 'cta_button', label: 'Texte du Bouton', type: 'text', placeholder: PAGE_DEFAULTS.cta_button },
                        ]
                    },
                ]}
            />
        </div>
    )
}
