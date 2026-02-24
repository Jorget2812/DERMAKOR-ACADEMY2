import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const PAGE_DEFAULTS: Record<string, string> = {
    page_header_title: "L'Académie Masterclass",
    page_header_subtitle: "Formations certifiantes et protocoles exclusifs pour les leaders de l'esthétique.",
    overview_title: "Un Curriculum d'Excellence",
    overview_subtitle: "Nos formations couvrent l'intégralité des pratiques dermo-esthétiques modernes.",
    feat1_title: "20+ Modules",
    feat1_desc: "Une bibliothèque complète couvrant les peelings, la mésothérapie et les technologies laser.",
    feat2_title: "Certifications",
    feat2_desc: "Obtenez des certificats officiels DERMAKOR validant vos nouvelles compétences.",
    feat3_title: "Protocoles Live",
    feat3_desc: "Apprenez grâce à des démonstrations vidéo haute définition sur modèles réels.",
    feat4_title: "Support Expert",
    feat4_desc: "Un accès direct à nos formateurs pour répondre à vos questions techniques.",
    how_title: "Comment ça marche ?",
    step1_title: "Inscription Pro",
    step1_desc: "Inscrivez-vous et faites valider votre compte professionnel.",
    step2_title: "Accès Immédiat",
    step2_desc: "Une fois approuvé, accédez à tous les modules de formation en ligne.",
    step3_title: "Certification",
    step3_desc: "Passez les quiz et obtenez votre certification pour chaque module fini.",
    cta_final_title: "Élevez vos standards aujourd'hui",
    testimonial_text: "L'éducation m'a permis de tripler ma rentabilité cabinet en seulement 6 mois.",
    testimonial_author: "Marie L., Esthéticienne Médicale",
    cta_final_button: "Devenir Partenaire",
}

export default async function AcademyInfoPageEditor() {
    const content = await getPageContents('academy-info', 'fr')

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
                        <h1 className="text-3xl font-serif text-primary">Page Nos Formations</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Modifiez le contenu de la page de présentation de l'académie.</p>
                    </div>
                </div>
                <Link href="/academy-info" target="_blank">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <ExternalLink size={14} /> Voir la page
                    </Button>
                </Link>
            </header>

            <PageContentEditor
                pageSlug="academy-info"
                pageName="Nos Formations"
                currentContent={content}
                defaultContent={PAGE_DEFAULTS}
                sections={[
                    {
                        title: "🎓 En-tête (Hero Sombre)",
                        fields: [
                            { key: 'page_header_title', label: 'Titre', type: 'text', placeholder: PAGE_DEFAULTS.page_header_title },
                            { key: 'page_header_subtitle', label: 'Sous-titre', type: 'textarea', placeholder: PAGE_DEFAULTS.page_header_subtitle },
                        ]
                    },
                    {
                        title: "📚 Vue d'Ensemble du Curriculum",
                        fields: [
                            { key: 'overview_title', label: 'Titre de Section', type: 'text', placeholder: PAGE_DEFAULTS.overview_title },
                            { key: 'overview_subtitle', label: 'Description', type: 'textarea', placeholder: PAGE_DEFAULTS.overview_subtitle },
                        ]
                    },
                    {
                        title: "⚡ Les 4 Points Forts",
                        fields: [
                            { key: 'feat1_title', label: 'Point Fort 1 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.feat1_title },
                            { key: 'feat1_desc', label: 'Point Fort 1 — Description', type: 'textarea', placeholder: PAGE_DEFAULTS.feat1_desc },
                            { key: 'feat2_title', label: 'Point Fort 2 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.feat2_title },
                            { key: 'feat2_desc', label: 'Point Fort 2 — Description', type: 'textarea', placeholder: PAGE_DEFAULTS.feat2_desc },
                            { key: 'feat3_title', label: 'Point Fort 3 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.feat3_title },
                            { key: 'feat3_desc', label: 'Point Fort 3 — Description', type: 'textarea', placeholder: PAGE_DEFAULTS.feat3_desc },
                            { key: 'feat4_title', label: 'Point Fort 4 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.feat4_title },
                            { key: 'feat4_desc', label: 'Point Fort 4 — Description', type: 'textarea', placeholder: PAGE_DEFAULTS.feat4_desc },
                        ]
                    },
                    {
                        title: "🔢 Comment ça marche",
                        fields: [
                            { key: 'how_title', label: 'Titre', type: 'text', placeholder: PAGE_DEFAULTS.how_title },
                            { key: 'step1_title', label: 'Étape 1 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.step1_title },
                            { key: 'step1_desc', label: 'Étape 1 — Description', type: 'text', placeholder: PAGE_DEFAULTS.step1_desc },
                            { key: 'step2_title', label: 'Étape 2 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.step2_title },
                            { key: 'step2_desc', label: 'Étape 2 — Description', type: 'text', placeholder: PAGE_DEFAULTS.step2_desc },
                            { key: 'step3_title', label: 'Étape 3 — Titre', type: 'text', placeholder: PAGE_DEFAULTS.step3_title },
                            { key: 'step3_desc', label: 'Étape 3 — Description', type: 'text', placeholder: PAGE_DEFAULTS.step3_desc },
                        ]
                    },
                    {
                        title: "💬 Témoignage & CTA Final",
                        fields: [
                            { key: 'cta_final_title', label: 'Titre', type: 'text', placeholder: PAGE_DEFAULTS.cta_final_title },
                            { key: 'testimonial_text', label: 'Citation', type: 'textarea', placeholder: PAGE_DEFAULTS.testimonial_text },
                            { key: 'testimonial_author', label: 'Auteur', type: 'text', placeholder: PAGE_DEFAULTS.testimonial_author },
                            { key: 'cta_final_button', label: 'Texte du Bouton', type: 'text', placeholder: PAGE_DEFAULTS.cta_final_button },
                        ]
                    },
                ]}
            />
        </div>
    )
}
