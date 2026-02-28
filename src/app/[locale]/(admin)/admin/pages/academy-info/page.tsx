import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const PAGE_DEFAULTS: Record<string, string> = {
    // Hero
    page_header_title: "NOS FORMATIONS E-LEARNING",
    page_header_subtitle: "Excellence & Expertise Coréenne. Maîtrisez les techniques de pointe avec nos formations certifiantes.",

    // Value Props
    vp1_title: "Suivi Personnalisé",
    vp1_desc: "1h d'échange professionnel inclus avec notre formatrice experte.",
    vp2_title: "Modules Complets",
    vp2_desc: "Théorie, zoom produits KRX & vidéos pratiques détaillées.",
    vp3_title: "Certificat Officiel",
    vp3_desc: "Reconnu par Krx Aesthetics pour chaque formation complétée.",

    // Formation 1: Hydraskin
    f1_title: "HYDRASKIN",
    f1_desc: "L'Hydraskin est une technique signature de Glass Skin, très demandada pour un teint lumineux.",
    f1_inc: "- Vidéos pratiques\n- Livret PDF\n- Accès fournisseurs",
    f1_level: "Débutant ★☆☆",
    f1_image: "https://cdn.shopify.com/s/files/1/0535/2724/9056/files/1_4.webp?v=1768297867",

    // Formation 2: Green Sea Peel
    f2_title: "GREEN SEA PEEL",
    f2_desc: "Maîtrisez le peeling aux algues, un soin naturel puissant pour le renouvellement cellulaire.",
    f2_inc: "- Vidéos détaillées\n- Protocoles PDF\n- Suivi illimité",
    f2_level: "Débutant ★☆☆",
    f2_image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",

    // Formation 3: Microneedling
    f3_title: "MICRONEEDLING",
    f3_desc: "Apprenez à stimuler le collagène avec le Dermapen pour traiter rides et imperfections.",
    f3_inc: "- Théorie avancée\n- Pratique sur modèle\n- Certificat inclus",
    f3_level: "Intermédiaire ★★☆",
    f3_image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800",

    // Engagements
    commit1_title: "Programme Expert",
    commit1_desc: "Contenu développé par des professionnels certifiés.",
    commit2_title: "Fournisseurs Exclusifs",
    commit2_desc: "Accès direct aux produits coréens KRX Aesthetics.",
    commit3_title: "Livret & Protocoles",
    commit3_desc: "Documentation PDF complète incluse.",
    commit4_title: "Suivi Illimité",
    commit4_desc: "Accompagnement continu après la formation.",

    // Final CTA
    cta_title: "PRÊTE À VOUS FORMER ?",
    cta_button: "S'inscrire Maintenant",
}

export default async function AcademyInfoPageEditor() {
    const content = await getPageContents('academy-info', 'fr')

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                            <ArrowLeft size={16} /> Pages
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif text-primary">Academy : Catalogue Formations</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Design inspiré de KRX Suisse avec le catalogue des 3 formations phares.</p>
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
                        title: "✨ En-tête (Hero)",
                        fields: [
                            { key: 'page_header_title', label: 'Titre Principal', type: 'text', placeholder: PAGE_DEFAULTS.page_header_title },
                            { key: 'page_header_subtitle', label: 'Description Hero', type: 'textarea', placeholder: PAGE_DEFAULTS.page_header_subtitle },
                        ]
                    },
                    {
                        title: "🛠️ Les 3 Piliers",
                        fields: [
                            { key: 'vp1_title', label: 'Pilier 1 - Titre', type: 'text' },
                            { key: 'vp1_desc', label: 'Pilier 1 - Desc', type: 'text' },
                            { key: 'vp2_title', label: 'Pilier 2 - Titre', type: 'text' },
                            { key: 'vp2_desc', label: 'Pilier 2 - Desc', type: 'text' },
                            { key: 'vp3_title', label: 'Pilier 3 - Titre', type: 'text' },
                            { key: 'vp3_desc', label: 'Pilier 3 - Desc', type: 'text' },
                        ]
                    },
                    {
                        title: "💧 Formation 1: HYDRASKIN",
                        fields: [
                            { key: 'f1_title', label: 'Nom Formation', type: 'text' },
                            { key: 'f1_desc', label: 'Description', type: 'textarea' },
                            { key: 'f1_inc', label: 'Inclusions (un par ligne)', type: 'textarea' },
                            { key: 'f1_level', label: 'Niveau (ex: Débutant ★☆☆)', type: 'text' },
                            { key: 'f1_image', label: 'URL Image', type: 'text' },
                        ]
                    },
                    {
                        title: "🌿 Formation 2: GREEN SEA PEEL",
                        fields: [
                            { key: 'f2_title', label: 'Nom Formation', type: 'text' },
                            { key: 'f2_desc', label: 'Description', type: 'textarea' },
                            { key: 'f2_inc', label: 'Inclusions', type: 'textarea' },
                            { key: 'f2_level', label: 'Niveau', type: 'text' },
                            { key: 'f2_image', label: 'URL Image', type: 'text' },
                        ]
                    },
                    {
                        title: "💉 Formation 3: MICRONEEDLING",
                        fields: [
                            { key: 'f3_title', label: 'Nom Formation', type: 'text' },
                            { key: 'f3_desc', label: 'Description', type: 'textarea' },
                            { key: 'f3_inc', label: 'Inclusions', type: 'textarea' },
                            { key: 'f3_level', label: 'Niveau', type: 'text' },
                            { key: 'f3_image', label: 'URL Image', type: 'text' },
                        ]
                    },
                    {
                        title: "🤝 Nos Engagements",
                        fields: [
                            { key: 'commit1_title', label: 'Engagement 1 - Titre', type: 'text' },
                            { key: 'commit1_desc', label: 'Engagement 1 - Desc', type: 'text' },
                            { key: 'commit2_title', label: 'Engagement 2 - Titre', type: 'text' },
                            { key: 'commit2_desc', label: 'Engagement 2 - Desc', type: 'text' },
                            { key: 'commit3_title', label: 'Engagement 3 - Titre', type: 'text' },
                            { key: 'commit3_desc', label: 'Engagement 3 - Desc', type: 'text' },
                            { key: 'commit4_title', label: 'Engagement 4 - Titre', type: 'text' },
                            { key: 'commit4_desc', label: 'Engagement 4 - Desc', type: 'text' },
                        ]
                    },
                    {
                        title: "🔔 Appel à l'Action Final",
                        fields: [
                            { key: 'cta_title', label: 'Titre CTA', type: 'text', placeholder: PAGE_DEFAULTS.cta_title },
                            { key: 'cta_button', label: 'Texte Bouton', type: 'text', placeholder: PAGE_DEFAULTS.cta_button },
                        ]
                    },
                ]}
            />
        </div>
    )
}
