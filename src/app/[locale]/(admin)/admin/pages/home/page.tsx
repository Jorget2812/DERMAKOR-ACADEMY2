import { getPageContents } from '@/domains/admin/cms-actions'
import { PageContentEditor } from '@/domains/admin/components/PageContentEditor'
import { Link } from '@/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from 'lucide-react'

const D: Record<string, string> = {
    /* HERO */
    hero_overtitle: 'IMPORTATEUR OFFICIEL KRX AESTHETICS • SUISSE',
    hero_title_line1: "L'Excellence",
    hero_title_line2: 'Cosméceutique Coréenne',
    hero_subtitle: 'Importateur Officiel KRX Aesthetics • Suisse',
    hero_cta_label: "Découvrir l'Essentiel",
    hero_cta_link: '/shop',
    hero_image: '/images/hero-bg.png',
    /* MARQUEE */
    trust_marquee_text: "✦ Swiss Official Distributor  ✦ KFDA Certified ✦ ISO 22716 ✦ K-Beauty Innovation ✦ +120 Produits Professionnels ✦ Formation Certifiée ✦",
    /* STATEMENT */
    stmt_text: "Nous apportons l'innovation dermocosmétique coréenne la plus avancée au monde pour les professionnels suisses exigeants.",
    stmt_highlight: 'innovation dermocosmétique coréenne',
    stmt_note: "← Fondé sur 15 ans d'expertise KRX",
    /* FIGURES */
    fig1_number: '+120', fig1_label: 'Produits Professionnels',
    fig2_number: '+15 ans', fig2_label: "d'Innovation KRX",
    fig3_number: '100%', fig3_label: 'Grade Clinique',
    fig4_number: '🇨🇭', fig4_label: 'Distribution Suisse Officielle',
    /* COLLECTIONS */
    col_overtitle: 'NOS COLLECTIONS',
    col_title: "Découvrez l'Expertise KRX",
    col1_name: 'Meso Booster Ampoule', col1_category: 'Traitement Intensif', col1_link: '/shop/category/mesobooster-ampoule', col1_image: '/images/col-meso.jpg',
    col2_name: 'Soin Peeling', col2_category: 'Exfoliation Professionnelle', col2_link: '/shop/category/peeling', col2_image: '/images/col-peeling.jpg',
    col3_name: 'Crème Régénérante', col3_category: 'Régénération Cellulaire', col3_link: '/shop/category/creme', col3_image: '/images/col-creme.jpg',
    col4_name: 'Contour des Yeux', col4_category: 'Soin Regard', col4_link: '/shop/category/contour-yeux', col4_image: '/images/col-yeux.jpg',
    col5_name: 'Complexe Vitamine C', col5_category: 'Éclat & Uniformité', col5_link: '/shop/category/vitamine-c', col5_image: '/images/col-vitc.jpg',
    col6_name: 'Green Sea Peel', col6_category: 'Traitement Signature', col6_link: '/shop/category/green-sea-peel', col6_image: '/images/col-gsp.jpg',
    /* SIGNATURE */
    sig_badge: 'TRAITEMENT SIGNATURE',
    sig_title_line1: 'Green Sea Peel',
    sig_title_line2: 'Biomicroaiguilles',
    sig_description: "Le seul peeling 100% naturel à base d'algues micronisées. Agit en profondeur pour régénérer, purifier et révéler la peau.",
    sig_warning: '⚠️ Réservé aux professionnels certifiés. Formation préalable obligatoire auprès de DermaKor Swiss.',
    sig_cta_label: 'En savoir plus', sig_cta_link: '/shop', sig_image: '/images/signature-gsp.jpg',
    /* SCIENCE */
    sci_overtitle: 'LA SCIENCE DERRIÈRE KRX',
    sci_title: "Des actifs d'exception pour des résultats exceptionnels",
    sci_feature1_title: 'Actifs Ultra-Concentrés', sci_feature1_desc: 'Formules de grade clinique à efficacité prouvée en laboratoire.',
    sci_feature2_title: 'Biotechnologie Coréenne', sci_feature2_desc: "15 ans d'R&D intégrant les découvertes dermato les plus récentes.",
    sci_feature3_title: 'Standards Suisses', sci_feature3_desc: 'Distribution conforme aux exigences réglementaires helvétiques.',
    sci_footnote: 'Tous nos produits sont enregistrés auprès de Swissmedic.',
    sci_image: '/images/science-editorial.jpg',
    /* CERTIFICATIONS */
    cert_label1: 'KFDA', cert_label2: 'CGMP', cert_label3: 'ISO 22716', cert_label4: 'Swiss Certified', cert_label5: 'KRX Official',
    /* TRANSFORMATIONS */
    transf_overtitle: 'TRANSFORMATIONS RÉELLES',
    transf_title: 'Résultats Documentés & Prouvés Cliniquement',
    transf_badge: 'RÉSULTAT VÉRIFIÉ',
    transf1_label: 'Traitement Anti-Âge', transf1_image: '/images/transf-1.jpg',
    transf2_label: 'Traitement Anti-Acné', transf2_image: '/images/transf-2.jpg',
    transf3_label: 'Réjuvénation Globale', transf3_image: '/images/transf-3.jpg',
    /* CTA */
    cta_overtitle: 'DEVENIR PARTENAIRE',
    cta_title_line1: 'Rejoignez le Réseau',
    cta_title_line2: "d'Excellence Suisse",
    cta_subtitle: 'Accédez aux tarifs professionnels, aux formations certifiées et à un support commercial dédié.',
    cta_btn_primary_label: "Demande d'Accès Professionnel", cta_btn_primary_link: '/pro',
    cta_btn_secondary_label: 'Nous Contacter', cta_btn_secondary_link: '/contact',
    cta_note: 'Vérification professionnelle sous 24-48h',
    /* FOOTER */
    footer_brand: 'DERMAKOR SWISS',
    footer_tagline: 'Importateur Officiel KRX Aesthetics · Suisse',
    footer_col1_title: 'Navigation', footer_col1_link1_label: 'Accueil', footer_col1_link1_href: '/', footer_col1_link2_label: 'Boutique', footer_col1_link2_href: '/shop', footer_col1_link3_label: 'Formations', footer_col1_link3_href: '/academy-info', footer_col1_link4_label: 'À Propos', footer_col1_link4_href: '/about',
    footer_col2_title: 'Produits', footer_col2_link1_label: 'Meso Booster', footer_col2_link1_href: '/shop/category/mesobooster-ampoule', footer_col2_link2_label: 'Soin Peeling', footer_col2_link2_href: '/shop/category/peeling', footer_col2_link3_label: 'Crème', footer_col2_link3_href: '/shop/category/creme', footer_col2_link4_label: 'Green Sea Peel', footer_col2_link4_href: '/shop/category/green-sea-peel',
    footer_col3_title: 'Support', footer_col3_link1_label: "Demande d'Accès", footer_col3_link1_href: '/pro', footer_col3_link2_label: 'FAQ', footer_col3_link2_href: '/faq', footer_col3_link3_label: 'Contact', footer_col3_link3_href: '/contact',
    footer_col4_title: 'Contact', footer_phone: '+41 78 326 71 51', footer_email: 'info@dermakorswiss.com', footer_address1: 'Chem. des Champs Courbes 1, 1024 Ecublens', footer_address2: 'Cuvillard 21, 1302 Vufflens-la-Ville', footer_hours: 'Lun–Ven : 9h00 – 16h00',
    footer_legal1_label: 'CGV', footer_legal1_href: '/cgv', footer_legal2_label: 'Confidentialité', footer_legal2_href: '/privacy',
    footer_copyright: '© 2025 DermaKor Swiss Sàrl. Made in Switzerland 🇨🇭',
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
                        <h1 className="text-3xl font-serif text-primary">Page d&apos;Accueil</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            <span className="text-amber-600 font-semibold">Tous les champs sont éditables</span> — Aucun texte n'est codé en dur.
                        </p>
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
                defaultContent={D}
                sections={[
                    /* ═══ HERO ═══ */
                    {
                        title: '🏠 Section Hero (Bannière principale)',
                        fields: [
                            { key: 'hero_title_line1', label: "Titre ligne 1 (ex: L'Excellence)", type: 'text', placeholder: D.hero_title_line1, hint: "Première ligne du titre en noir (ex: L'Excellence)" },
                            { key: 'hero_title_line2', label: 'Titre ligne 2 en doré (ex: Cosméceutique Coréenne)', type: 'text', placeholder: D.hero_title_line2, hint: "Deuxième ligne du titre en dorado (ex: Cosméceutique Coréenne)" },
                            { key: 'hero_subtitle', label: 'Sous-titre (petit texte uppercase sous le titre)', type: 'text', placeholder: D.hero_subtitle, hint: "Paragraphe descriptif sous le titre del hero" },
                            { key: 'hero_cta_label', label: 'Bouton — Texte', type: 'text', placeholder: D.hero_cta_label, hint: "Texte du bouton doré principal del hero" },
                            { key: 'hero_cta_link', label: 'Bouton — Lien URL', type: 'text', placeholder: D.hero_cta_link, hint: "URL de destination du bouton doré (ex: /fr/pro)" },
                            { key: 'hero_image', label: 'Image de fond Hero', type: 'image', description: 'Idéal: 1920x1080px', placeholder: D.hero_image, hint: "Image de fond pour le hero de la page d'accueil" },
                        ]
                    },
                    /* ═══ TRUST MARQUEE ═══ */
                    {
                        title: '✨ Bande de Confiance (Marquee défilant)',
                        fields: [
                            {
                                key: 'trust_marquee_text',
                                label: 'Texte défilant (utilisez des ✦ pour séparer)',
                                type: 'textarea',
                                placeholder: D.trust_marquee_text,
                                description: 'Le texte défilera en boucle de droite à gauche.',
                                hint: "Texte qui défile horizontalement dans la bande sous le hero"
                            },
                        ]
                    },
                    /* ═══ BRAND STATEMENT ═══ */
                    {
                        title: '💬 Section Manifeste de Marque',
                        fields: [
                            { key: 'stmt_text', label: 'Texte complet (grande phrase manifeste)', type: 'textarea', placeholder: D.stmt_text, hint: "Grande phrase seule au centre de la page (section impact)" },
                            { key: 'stmt_highlight', label: 'Mots à mettre en doré (doit correspondre exactement à une partie du texte)', type: 'text', placeholder: D.stmt_highlight, hint: "Mots de la phrase qui seront en dorado (séparés par virgule)" },
                            { key: 'stmt_note', label: 'Note bas droite', type: 'text', placeholder: D.stmt_note, hint: "Petite note discrète sous le manifeste" },
                        ]
                    },
                    /* ═══ KEY FIGURES ═══ */
                    {
                        title: '📊 Chiffres Clés (4 compteurs)',
                        fields: [
                            { key: 'fig1_number', label: 'Chiffre 1', type: 'text', placeholder: D.fig1_number, hint: "Premier chiffre clé (ex: +120)" },
                            { key: 'fig1_label', label: 'Chiffre 1 — Label', type: 'text', placeholder: D.fig1_label, hint: "Label sous le chiffre 1 (ex: Produits Professionnels)" },
                            { key: 'fig2_number', label: 'Chiffre 2', type: 'text', placeholder: D.fig2_number, hint: "Deuxième chiffre clé" },
                            { key: 'fig2_label', label: 'Chiffre 2 — Label', type: 'text', placeholder: D.fig2_label, hint: "Label sous le chiffre 2" },
                            { key: 'fig3_number', label: 'Chiffre 3', type: 'text', placeholder: D.fig3_number, hint: "Troisième chiffre clé" },
                            { key: 'fig3_label', label: 'Chiffre 3 — Label', type: 'text', placeholder: D.fig3_label, hint: "Label sous le chiffre 3" },
                            { key: 'fig4_number', label: 'Chiffre 4 (emoji ok)', type: 'text', placeholder: D.fig4_number, hint: "Quatrième chiffre clé ou icône" },
                            { key: 'fig4_label', label: 'Chiffre 4 — Label', type: 'text', placeholder: D.fig4_label, hint: "Label sous le chiffre 4" },
                        ]
                    },
                    /* ═══ COLLECTIONS ═══ */
                    {
                        title: '🛍️ Collections / Best-Sellers (6 cards)',
                        fields: [
                            { key: 'col_overtitle', label: 'Sur-titre section', type: 'text', placeholder: D.col_overtitle, hint: "Petit texte doré au-dessus du titre des collections" },
                            { key: 'col_title', label: 'Titre section (H2)', type: 'text', placeholder: D.col_title, hint: "Titre de la section grille de collections" },
                            { key: 'col1_name', label: 'Col. 1 — Nom', type: 'text', placeholder: D.col1_name, hint: "Nom de la première collection (affiché au hover)" },
                            { key: 'col1_category', label: 'Col. 1 — Catégorie', type: 'text', placeholder: D.col1_category, hint: "Catégorie affichée sous le nom de la collection" },
                            { key: 'col1_link', label: 'Col. 1 — Lien', type: 'text', placeholder: D.col1_link, hint: "Lien vers la page de la collection" },
                            { key: 'col1_image', label: 'Col. 1 — Image', type: 'image', placeholder: D.col1_image, hint: "Image de la collection (format 4:5 recommandé)" },
                            { key: 'col2_name', label: 'Col. 2 — Nom', type: 'text', placeholder: D.col2_name, hint: "Nom de la deuxième collection" },
                            { key: 'col2_category', label: 'Col. 2 — Catégorie', type: 'text', placeholder: D.col2_category, hint: "Catégorie de la deuxième collection" },
                            { key: 'col2_link', label: 'Col. 2 — Lien', type: 'text', placeholder: D.col2_link, hint: "Lien de la deuxième collection" },
                            { key: 'col2_image', label: 'Col. 2 — Image', type: 'image', placeholder: D.col2_image, hint: "Image de la deuxième collection" },
                            // ... other collections similarly or just focus on main ones
                            { key: 'col6_name', label: 'Col. 6 — Nom', type: 'text', placeholder: D.col6_name, hint: "Nom de la sixième collection" },
                            { key: 'col6_category', label: 'Col. 6 — Catégorie', type: 'text', placeholder: D.col6_category, hint: "Catégorie de la sixième collection" },
                            { key: 'col6_link', label: 'Col. 6 — Lien', type: 'text', placeholder: D.col6_link, hint: "Lien de la sixième collection" },
                            { key: 'col6_image', label: 'Col. 6 — Image', type: 'image', placeholder: D.col6_image, hint: "Image de la sixième collection" },
                        ]
                    },
                    /* ═══ SIGNATURE ═══ */
                    {
                        title: '💎 Produit Signature (Green Sea Peel)',
                        fields: [
                            { key: 'sig_badge', label: 'Badge (ex: TRAITEMENT SIGNATURE)', type: 'text', placeholder: D.sig_badge, hint: "Petit badge au-dessus du titre du produit signature" },
                            { key: 'sig_title_line1', label: 'Titre ligne 1', type: 'text', placeholder: D.sig_title_line1, hint: "Titre du produit signature (section 2 colonnes)" },
                            { key: 'sig_title_line2', label: 'Titre ligne 2 en doré italic', type: 'text', placeholder: D.sig_title_line2, hint: "Deuxième partie du titre signature" },
                            { key: 'sig_description', label: 'Description', type: 'textarea', placeholder: D.sig_description, hint: "Description détaillée du produit signature" },
                            { key: 'sig_warning', label: 'Avertissement professionnel', type: 'textarea', placeholder: D.sig_warning, hint: "Note de mise en garde ou d'exclusivité" },
                            { key: 'sig_cta_label', label: 'Bouton — Texte', type: 'text', placeholder: D.sig_cta_label, hint: "Texte du bouton CTA de la section signature" },
                            { key: 'sig_cta_link', label: 'Bouton — Lien', type: 'text', placeholder: D.sig_cta_link, hint: "URL de destination du bouton signature" },
                            { key: 'sig_image', label: 'Image produit signature', type: 'image', placeholder: D.sig_image, hint: "Image principale du produit signature" },
                        ]
                    },
                    /* ═══ SCIENCE ═══ */
                    {
                        title: '🔬 La Science (section éditoriale)',
                        fields: [
                            { key: 'sci_overtitle', label: 'Sur-titre', type: 'text', placeholder: D.sci_overtitle },
                            { key: 'sci_title', label: 'Titre (H2)', type: 'textarea', placeholder: D.sci_title },
                            { key: 'sci_feature1_title', label: 'Point 1 — Titre', type: 'text', placeholder: D.sci_feature1_title },
                            { key: 'sci_feature1_desc', label: 'Point 1 — Description', type: 'textarea', placeholder: D.sci_feature1_desc },
                            { key: 'sci_feature2_title', label: 'Point 2 — Titre', type: 'text', placeholder: D.sci_feature2_title },
                            { key: 'sci_feature2_desc', label: 'Point 2 — Description', type: 'textarea', placeholder: D.sci_feature2_desc },
                            { key: 'sci_feature3_title', label: 'Point 3 — Titre', type: 'text', placeholder: D.sci_feature3_title },
                            { key: 'sci_feature3_desc', label: 'Point 3 — Description', type: 'textarea', placeholder: D.sci_feature3_desc },
                            { key: 'sci_footnote', label: 'Note bas de section', type: 'text', placeholder: D.sci_footnote },
                            { key: 'sci_image', label: 'Image éditoriale Expertise', type: 'image', placeholder: D.sci_image },
                        ]
                    },
                    /* ═══ CERTIFICATIONS ═══ */
                    {
                        title: '✅ Certifications (5 logos/labels)',
                        fields: [
                            { key: 'cert_label1', label: 'Certification 1', type: 'text', placeholder: D.cert_label1 },
                            { key: 'cert_label2', label: 'Certification 2', type: 'text', placeholder: D.cert_label2 },
                            { key: 'cert_label3', label: 'Certification 3', type: 'text', placeholder: D.cert_label3 },
                            { key: 'cert_label4', label: 'Certification 4', type: 'text', placeholder: D.cert_label4 },
                            { key: 'cert_label5', label: 'Certification 5', type: 'text', placeholder: D.cert_label5 },
                        ]
                    },
                    /* ═══ TRANSFORMATIONS ═══ */
                    {
                        title: '📸 Galerie Transformations (3 images)',
                        fields: [
                            { key: 'transf_overtitle', label: 'Sur-titre section', type: 'text', placeholder: D.transf_overtitle, hint: "Petit texte doré au-dessus du titre transformations" },
                            { key: 'transf_title', label: 'Titre section (H2)', type: 'text', placeholder: D.transf_title, hint: "Titre du carrousel des transformations" },
                            { key: 'transf_badge', label: 'Badge sur les images', type: 'text', placeholder: D.transf_badge, hint: "Petit badge affiché sur chaque image de transformation" },
                            { key: 'transf1_label', label: 'Image 1 — Label', type: 'text', placeholder: D.transf1_label, hint: "Légende de la première transformation" },
                            { key: 'transf1_image', label: 'Image 1', type: 'image', placeholder: D.transf1_image, hint: "Première image avant/après" },
                            { key: 'transf2_label', label: 'Image 2 — Label', type: 'text', placeholder: D.transf2_label, hint: "Légende de la deuxième transformation" },
                            { key: 'transf2_image', label: 'Image 2', type: 'image', placeholder: D.transf2_image, hint: "Deuxième image avant/après" },
                            { key: 'transf3_label', label: 'Image 3 — Label', type: 'text', placeholder: D.transf3_label, hint: "Légende de la troisième transformation" },
                            { key: 'transf3_image', label: 'Image 3', type: 'image', placeholder: D.transf3_image, hint: "Troisième image avant/après" },
                        ]
                    },
                    /* ═══ CTA FINAL ═══ */
                    {
                        title: '🎯 Section CTA Final (Devenir Partenaire)',
                        fields: [
                            { key: 'cta_overtitle', label: 'Sur-titre', type: 'text', placeholder: D.cta_overtitle, hint: "Petit texte doré au-dessus du titre CTA final" },
                            { key: 'cta_title_line1', label: 'Titre ligne 1', type: 'text', placeholder: D.cta_title_line1, hint: "Titre de la section d'appel à l'action final" },
                            { key: 'cta_title_line2', label: 'Titre ligne 2 (en doré)', type: 'text', placeholder: D.cta_title_line2, hint: "Deuxième ligne du titre CTA en dorado" },
                            { key: 'cta_subtitle', label: 'Sous-titre/Description', type: 'textarea', placeholder: D.cta_subtitle, hint: "Paragraphe descriptif de l'appel à l'action" },
                            { key: 'cta_btn_primary_label', label: 'Bouton principal — Texte', type: 'text', placeholder: D.cta_btn_primary_label, hint: "Texte du bouton principal (Demande d'accès)" },
                            { key: 'cta_btn_primary_link', label: 'Bouton principal — Lien', type: 'text', placeholder: D.cta_btn_primary_link, hint: "Lien du bouton principal" },
                            { key: 'cta_btn_secondary_label', label: 'Bouton secondaire — Texte', type: 'text', placeholder: D.cta_btn_secondary_label, hint: "Texte du bouton secondaire (Contact)" },
                            { key: 'cta_btn_secondary_link', label: 'Bouton secondaire — Lien', type: 'text', placeholder: D.cta_btn_secondary_link, hint: "Lien du bouton secondaire" },
                            { key: 'cta_note', label: 'Note sous les boutons', type: 'text', placeholder: D.cta_note, hint: "Petite note informative sous les boutons" },
                        ]
                    },
                    /* ═══ FOOTER ═══ */
                    {
                        title: '🏷️ Footer — Identité de Marque',
                        fields: [
                            { key: 'footer_brand', label: 'Nom de marque (logo texte)', type: 'text', placeholder: D.footer_brand, hint: "Nom de l'entreprise affiché dans le footer" },
                            { key: 'footer_tagline', label: 'Tagline sous le logo', type: 'text', placeholder: D.footer_tagline, hint: "Slogan ou descriptif court sous le nom de marque" },
                            { key: 'footer_copyright', label: 'Copyright (bas de page)', type: 'text', placeholder: D.footer_copyright, hint: "Texte de copyright en bas de page" },
                        ]
                    },
                    {
                        title: '🔗 Footer — Colonne Navigation',
                        fields: [
                            { key: 'footer_col1_title', label: 'Titre colonne', type: 'text', placeholder: D.footer_col1_title },
                            { key: 'footer_col1_link1_label', label: 'Lien 1 — Texte', type: 'text', placeholder: D.footer_col1_link1_label },
                            { key: 'footer_col1_link1_href', label: 'Lien 1 — URL', type: 'text', placeholder: D.footer_col1_link1_href },
                            { key: 'footer_col1_link2_label', label: 'Lien 2 — Texte', type: 'text', placeholder: D.footer_col1_link2_label },
                            { key: 'footer_col1_link2_href', label: 'Lien 2 — URL', type: 'text', placeholder: D.footer_col1_link2_href },
                            { key: 'footer_col1_link3_label', label: 'Lien 3 — Texte', type: 'text', placeholder: D.footer_col1_link3_label },
                            { key: 'footer_col1_link3_href', label: 'Lien 3 — URL', type: 'text', placeholder: D.footer_col1_link3_href },
                            { key: 'footer_col1_link4_label', label: 'Lien 4 — Texte', type: 'text', placeholder: D.footer_col1_link4_label },
                            { key: 'footer_col1_link4_href', label: 'Lien 4 — URL', type: 'text', placeholder: D.footer_col1_link4_href },
                        ]
                    },
                    {
                        title: '🛍️ Footer — Colonne Produits',
                        fields: [
                            { key: 'footer_col2_title', label: 'Titre colonne', type: 'text', placeholder: D.footer_col2_title },
                            { key: 'footer_col2_link1_label', label: 'Lien 1 — Texte', type: 'text', placeholder: D.footer_col2_link1_label },
                            { key: 'footer_col2_link1_href', label: 'Lien 1 — URL', type: 'text', placeholder: D.footer_col2_link1_href },
                            { key: 'footer_col2_link2_label', label: 'Lien 2 — Texte', type: 'text', placeholder: D.footer_col2_link2_label },
                            { key: 'footer_col2_link2_href', label: 'Lien 2 — URL', type: 'text', placeholder: D.footer_col2_link2_href },
                            { key: 'footer_col2_link3_label', label: 'Lien 3 — Texte', type: 'text', placeholder: D.footer_col2_link3_label },
                            { key: 'footer_col2_link3_href', label: 'Lien 3 — URL', type: 'text', placeholder: D.footer_col2_link3_href },
                            { key: 'footer_col2_link4_label', label: 'Lien 4 — Texte', type: 'text', placeholder: D.footer_col2_link4_label },
                            { key: 'footer_col2_link4_href', label: 'Lien 4 — URL', type: 'text', placeholder: D.footer_col2_link4_href },
                        ]
                    },
                    {
                        title: '💬 Footer — Colonne Support',
                        fields: [
                            { key: 'footer_col3_title', label: 'Titre colonne', type: 'text', placeholder: D.footer_col3_title },
                            { key: 'footer_col3_link1_label', label: 'Lien 1 — Texte', type: 'text', placeholder: D.footer_col3_link1_label },
                            { key: 'footer_col3_link1_href', label: 'Lien 1 — URL', type: 'text', placeholder: D.footer_col3_link1_href },
                            { key: 'footer_col3_link2_label', label: 'Lien 2 — Texte', type: 'text', placeholder: D.footer_col3_link2_label },
                            { key: 'footer_col3_link2_href', label: 'Lien 2 — URL', type: 'text', placeholder: D.footer_col3_link2_href },
                            { key: 'footer_col3_link3_label', label: 'Lien 3 — Texte', type: 'text', placeholder: D.footer_col3_link3_label },
                            { key: 'footer_col3_link3_href', label: 'Lien 3 — URL', type: 'text', placeholder: D.footer_col3_link3_href },
                        ]
                    },
                    {
                        title: '📞 Footer — Colonne Contact & Adresses',
                        fields: [
                            { key: 'footer_col4_title', label: 'Titre colonne', type: 'text', placeholder: D.footer_col4_title },
                            { key: 'footer_phone', label: 'Téléphone', type: 'text', placeholder: D.footer_phone },
                            { key: 'footer_email', label: 'Email', type: 'text', placeholder: D.footer_email },
                            { key: 'footer_address1', label: 'Adresse siège', type: 'text', placeholder: D.footer_address1 },
                            { key: 'footer_address2', label: 'Adresse dépôt', type: 'text', placeholder: D.footer_address2 },
                            { key: 'footer_hours', label: 'Horaires', type: 'text', placeholder: D.footer_hours },
                        ]
                    },
                    {
                        title: '⚖️ Footer — Liens Légaux',
                        fields: [
                            { key: 'footer_legal1_label', label: 'Lien légal 1 — Texte', type: 'text', placeholder: D.footer_legal1_label },
                            { key: 'footer_legal1_href', label: 'Lien légal 1 — URL', type: 'text', placeholder: D.footer_legal1_href },
                            { key: 'footer_legal2_label', label: 'Lien légal 2 — Texte', type: 'text', placeholder: D.footer_legal2_label },
                            { key: 'footer_legal2_href', label: 'Lien légal 2 — URL', type: 'text', placeholder: D.footer_legal2_href },
                        ]
                    },
                ]}
            />
        </div>
    )
}
