import { Link } from '@/navigation'
import { getTranslations } from 'next-intl/server'
import { getPageContents, type Locale } from '@/domains/admin/cms-actions'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Marquee } from '@/components/ui/marquee'
import { ArrowRight, ArrowDown, ShieldCheck, FlaskConical, GraduationCap, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { TransformationCarousel } from '@/components/TransformationCarousel'

/* ──────────────────────────────────────────
   DEFAULT CONTENT (FR — CMS fallback)
   EVERY key here maps to a page_contents row
────────────────────────────────────────── */
const DEFAULTS: Record<string, string> = {
    /* HERO */
    hero_overtitle: 'IMPORTATEUR OFFICIEL KRX AESTHETICS • SUISSE',
    hero_title_line1: "L'Excellence",
    hero_title_line2: 'Cosméceutique Coréenne',
    hero_subtitle: 'Importateur Officiel KRX Aesthetics • Suisse',
    hero_cta_label: "Découvrir l'Essentiel",
    hero_cta_link: '/shop',
    hero_image: '/images/hero-bg.png',

    /* BRAND STATEMENT */
    stmt_text: "Nous apportons l'innovation dermocosmétique coréenne la plus avancée au monde pour les professionnels suisses exigeants.",
    stmt_highlight: "innovation dermocosmétique coréenne",
    stmt_note: "← Fondé sur 15 ans d'expertise KRX",

    /* KEY FIGURES */
    fig1_number: '+120',
    fig1_label: 'Produits Professionnels',
    fig2_number: '+15 ans',
    fig2_label: "d'Innovation KRX",
    fig3_number: '100%',
    fig3_label: 'Grade Clinique',
    fig4_number: '🇨🇭',
    fig4_label: 'Distribution Suisse Officielle',

    /* COLLECTIONS */
    col_overtitle: 'NOS COLLECTIONS',
    col_title: "Découvrez l'Expertise KRX",
    col1_name: 'Meso Booster Ampoule',
    col1_category: 'Traitement Intensif',
    col1_link: '/shop/category/mesobooster-ampoule',
    col1_image: '/images/col-meso.jpg',
    col2_name: 'Soin Peeling',
    col2_category: 'Exfoliation Professionnelle',
    col2_link: '/shop/category/peeling',
    col2_image: '/images/col-peeling.jpg',
    col3_name: 'Crème Régénérante',
    col3_category: 'Régénération Cellulaire',
    col3_link: '/shop/category/creme',
    col3_image: '/images/col-creme.jpg',
    col4_name: 'Contour des Yeux',
    col4_category: 'Soin Regard',
    col4_link: '/shop/category/contour-yeux',
    col4_image: '/images/col-yeux.jpg',
    col5_name: 'Complexe Vitamine C',
    col5_category: 'Éclat & Uniformité',
    col5_link: '/shop/category/vitamine-c',
    col5_image: '/images/col-vitc.jpg',
    col6_name: 'Green Sea Peel',
    col6_category: 'Traitement Signature',
    col6_link: '/shop/category/green-sea-peel',
    col6_image: '/images/col-gsp.jpg',

    /* SIGNATURE PRODUCT */
    sig_badge: 'TRAITEMENT SIGNATURE',
    sig_title_line1: 'Green Sea Peel',
    sig_title_line2: 'Biomicroaiguilles',
    sig_description: "Le seul peeling 100% naturel à base d'algues micronisées. Agit en profondeur pour régénérer, purifier et révéler la peau.",
    sig_warning: '⚠️ Réservé aux professionnels certifiés. Formation préalable obligatoire auprès de DermaKor Swiss.',
    sig_cta_label: 'En savoir plus',
    sig_cta_link: '/shop',
    sig_image: '/images/signature-gsp.jpg',

    /* SCIENCE */
    sci_overtitle: 'LA SCIENCE DERRIÈRE KRX',
    sci_title: "Des actifs d'exception pour des résultats exceptionnels",
    sci_feature1_title: 'Actifs Ultra-Concentrés',
    sci_feature1_desc: 'Formules de grade clinique à efficacité prouvée en laboratoire.',
    sci_feature2_title: 'Biotechnologie Coréenne',
    sci_feature2_desc: "15 ans d'R&D intégrant les découvertes dermato les plus récentes.",
    sci_feature3_title: 'Standards Suisses',
    sci_feature3_desc: 'Distribution conforme aux exigences réglementaires helvétiques.',
    sci_footnote: 'Tous nos produits sont enregistrés auprès de Swissmedic.',
    sci_image: '/images/science-editorial.jpg',

    /* CERTIFICATIONS */
    cert_label1: 'KFDA',
    cert_label2: 'CGMP',
    cert_label3: 'ISO 22716',
    cert_label4: 'Swiss Certified',
    cert_label5: 'KRX Official',

    /* TRANSFORMATIONS */
    transf_overtitle: 'TRANSFORMATIONS RÉELLES',
    transf_title: 'Solutions Esthétiques Professionnelles',
    transf_badge: 'RÉSULTAT VÉRIFIÉ',
    transf1_title: 'Ampoule Meso Booster',
    transf1_desc: 'Réduction visible des ridules et hydratation intense après 3 séances.',
    transf1_image: '/images/transf-1.jpg',
    transf2_title: 'Soin Peeling Clarifiant',
    transf2_desc: "Texture de peau affinée et pores resserrés. Teint éclatant dès la première application.",
    transf2_image: '/images/transf-2.jpg',
    transf3_title: 'Green Sea Peel',
    transf3_desc: 'Restauration complète de la barrière cutanée et régénération profonde.',
    transf3_image: '/images/transf-3.jpg',
    transf4_title: 'Complexe Vitamine C',
    transf4_desc: 'Réduction des taches pigmentaires et uniformisation du teint.',
    transf4_image: '/images/transf-4.jpg',
    transf5_title: 'Crème Régénérante',
    transf5_desc: 'Soin post-traitement accélérant la cicatrisation et le confort.',
    transf5_image: '/images/transf-5.jpg',

    /* CTA FINAL */
    cta_overtitle: 'DEVENIR PARTENAIRE',
    cta_title_line1: 'Rejoignez le Réseau',
    cta_title_line2: "d'Excellence Suisse",
    cta_subtitle: 'Accédez aux tarifs professionnels, aux formations certifiées et à un support commercial dédié.',
    cta_btn_primary_label: "Demande d'Accès Professionnel",
    cta_btn_primary_link: '/pro',
    cta_btn_secondary_label: 'Nous Contacter',
    cta_btn_secondary_link: '/contact',
    cta_note: 'Vérification professionnelle sous 24-48h',

    /* FOOTER */
    footer_brand: 'DERMAKOR SWISS',
    footer_tagline: 'Importateur Officiel KRX Aesthetics · Suisse',
    footer_col1_title: 'Navigation',
    footer_col1_link1_label: 'Accueil',
    footer_col1_link1_href: '/',
    footer_col1_link2_label: 'Boutique',
    footer_col1_link2_href: '/shop',
    footer_col1_link3_label: 'Formations',
    footer_col1_link3_href: '/academy-info',
    footer_col1_link4_label: 'À Propos',
    footer_col1_link4_href: '/about',
    footer_col2_title: 'Produits',
    footer_col2_link1_label: 'Meso Booster',
    footer_col2_link1_href: '/shop/category/mesobooster-ampoule',
    footer_col2_link2_label: 'Soin Peeling',
    footer_col2_link2_href: '/shop/category/peeling',
    footer_col2_link3_label: 'Crème',
    footer_col2_link3_href: '/shop/category/creme',
    footer_col2_link4_label: 'Green Sea Peel',
    footer_col2_link4_href: '/shop/category/green-sea-peel',
    footer_col3_title: 'Support',
    footer_col3_link1_label: "Demande d'Accès",
    footer_col3_link1_href: '/pro',
    footer_col3_link2_label: 'FAQ',
    footer_col3_link2_href: '/faq',
    footer_col3_link3_label: 'Contact',
    footer_col3_link3_href: '/contact',
    footer_col4_title: 'Contact',
    footer_phone: '+41 78 326 71 51',
    footer_email: 'info@dermakorswiss.com',
    footer_address1: 'Chem. des Champs Courbes 1, 1024 Ecublens',
    footer_address2: 'Cuvillard 21, 1302 Vufflens-la-Ville',
    footer_hours: 'Lun–Ven : 9h00 – 16h00',
    footer_legal1_label: 'CGV',
    footer_legal1_href: '/cgv',
    footer_legal2_label: 'Confidentialité',
    footer_legal2_href: '/privacy',
    footer_copyright: '© 2025 DermaKor Swiss Sàrl. Made in Switzerland 🇨🇭',
}

function g(cms: Record<string, string>, key: string): string {
    return cms[key] || DEFAULTS[key] || ''
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const cms = await getPageContents('home', (locale || 'fr') as Locale)

    /* Build brand statement with highlighted phrase */
    const stmtText = g(cms, 'stmt_text')
    const stmtHighlight = g(cms, 'stmt_highlight')
    const stmtParts = stmtHighlight
        ? stmtText.split(stmtHighlight)
        : [stmtText]

    return (
        <div className="flex flex-col w-full overflow-x-hidden">

            {/* ════════════════════════════════════════
                SECTION 1 — HERO CINEMATOGRÁFICO
            ════════════════════════════════════════ */}
            <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={g(cms, 'hero_image')}
                        alt="DermaKor Swiss — KRX Aesthetics"
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                    {/* Warm light overlay — champagne tint, NOT black */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF8]/85 via-[#FAFAF8]/50 to-transparent z-10" />
                </div>

                <div className="container relative z-20 px-6 md:px-12 max-w-7xl mx-auto">
                    <div className="max-w-[620px] space-y-8">
                        <div className="space-y-1">
                            <h1 className="font-oswald leading-[1.05]">
                                <span className="block text-5xl md:text-7xl xl:text-[88px] font-light text-[#262626] tracking-tight">
                                    {g(cms, 'hero_title_line1')}
                                </span>
                                <span className="block text-5xl md:text-7xl xl:text-[88px] font-bold italic text-[#C0A76A] tracking-tight">
                                    {g(cms, 'hero_title_line2')}
                                </span>
                            </h1>
                        </div>

                        {/* Gold rule */}
                        <div className="w-20 h-px bg-[#C0A76A]" />

                        <p className="font-oswald text-xs uppercase tracking-[4px] text-[#6B6560]">
                            {g(cms, 'hero_subtitle')}
                        </p>

                        <div className="pt-2 flex items-center gap-3">
                            <Link
                                href={g(cms, 'hero_cta_link')}
                                className="inline-flex items-center gap-3 px-8 py-3.5 border border-[#262626] text-[#262626] font-oswald text-xs uppercase tracking-[2px] hover:bg-[#262626] hover:text-white transition-all duration-300 group"
                            >
                                {g(cms, 'hero_cta_label')}
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                    <div className="w-px h-12 bg-[#C0A76A] animate-pulse" />
                    <ArrowDown size={12} className="text-[#C0A76A]" />
                </div>
            </section>

            {/* ════════════════════════════════════════
                SECTION 2 — BRAND STATEMENT
            ════════════════════════════════════════ */}
            <section className="bg-[#FAFAF8] py-28 md:py-36">
                <ScrollReveal>
                    <div className="container mx-auto px-6 md:px-12 max-w-6xl">
                        <div className="flex gap-10 md:gap-16 items-start">
                            {/* Vertical label */}
                            <div className="hidden md:flex flex-col items-center gap-4 pt-2 shrink-0">
                                <div className="w-px h-20 bg-[#C0A76A]" />
                                <span
                                    className="font-oswald text-[10px] uppercase tracking-[3px] text-[#C0A76A] whitespace-nowrap"
                                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                >
                                    DermaKor Swiss
                                </span>
                            </div>

                            <div className="space-y-8">
                                <p className="font-oswald text-3xl md:text-4xl xl:text-[52px] leading-[1.2] text-[#262626] italic">
                                    {stmtParts.length > 1 ? (
                                        <>
                                            {stmtParts[0]}
                                            <span className="text-[#C0A76A] not-italic">{stmtHighlight}</span>
                                            {stmtParts[1]}
                                        </>
                                    ) : stmtText}
                                </p>

                                <p className="text-right font-oswald text-xs uppercase tracking-[2px] text-[#6B6560]">
                                    {g(cms, 'stmt_note')}
                                </p>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* ════════════════════════════════════════
                SECTION 3 — CHIFFRES CLÉS
            ════════════════════════════════════════ */}
            <section className="bg-[#F5F0EB] py-20 border-y border-[#E8E4DC]">
                {/* Gold top rule */}
                <div className="h-px bg-[#C0A76A] w-full mb-0" style={{ height: '1px', background: '#C0A76A', marginBottom: 0 }} />
                <div className="container mx-auto px-6 md:px-12 max-w-6xl py-16">
                    <ScrollReveal>
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E8E4DC]">
                            {[
                                { n: g(cms, 'fig1_number'), l: g(cms, 'fig1_label') },
                                { n: g(cms, 'fig2_number'), l: g(cms, 'fig2_label') },
                                { n: g(cms, 'fig3_number'), l: g(cms, 'fig3_label') },
                                { n: g(cms, 'fig4_number'), l: g(cms, 'fig4_label') },
                            ].map((fig, i) => (
                                <div key={i} className="flex flex-col items-center justify-center text-center py-6 md:py-0 px-4 md:px-8 gap-3">
                                    <span className="font-oswald font-bold text-5xl md:text-6xl xl:text-7xl text-[#C0A76A] leading-none">
                                        {fig.n}
                                    </span>
                                    <span className="font-oswald text-[10px] uppercase tracking-[3px] text-[#6B6560]">
                                        {fig.l}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
                <div className="h-px" style={{ height: '1px', background: '#E8E4DC' }} />
            </section>

            {/* ════════════════════════════════════════
                SECTION 4 — COLLECTIONS ÉDITORIAL
            ════════════════════════════════════════ */}
            <section className="bg-[#FFFFFF] py-24 md:py-32">
                <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                    <ScrollReveal>
                        <div className="mb-12">
                            <span className="font-oswald text-[11px] uppercase tracking-[4px] text-[#C0A76A]">
                                {g(cms, 'col_overtitle')}
                            </span>
                            <h2 className="font-oswald text-4xl md:text-[48px] text-[#262626] mt-3">
                                {g(cms, 'col_title')}
                            </h2>
                        </div>
                    </ScrollReveal>

                    {/* ROW 1: large left (col1) + 2 stacked right (col2, col3) */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                        <ScrollReveal className="md:col-span-3">
                            <CollectionCard
                                name={g(cms, 'col1_name')}
                                category={g(cms, 'col1_category')}
                                link={g(cms, 'col1_link')}
                                image={g(cms, 'col1_image')}
                                aspectClass="aspect-[4/3]"
                            />
                        </ScrollReveal>
                        <div className="md:col-span-2 grid grid-rows-2 gap-2">
                            <ScrollReveal delay={100}>
                                <CollectionCard
                                    name={g(cms, 'col2_name')}
                                    category={g(cms, 'col2_category')}
                                    link={g(cms, 'col2_link')}
                                    image={g(cms, 'col2_image')}
                                    aspectClass="aspect-[4/3]"
                                />
                            </ScrollReveal>
                            <ScrollReveal delay={150}>
                                <CollectionCard
                                    name={g(cms, 'col3_name')}
                                    category={g(cms, 'col3_category')}
                                    link={g(cms, 'col3_link')}
                                    image={g(cms, 'col3_image')}
                                    aspectClass="aspect-[4/3]"
                                />
                            </ScrollReveal>
                        </div>
                    </div>

                    {/* ROW 2: 2 stacked left (col4, col5) + large right (col6) */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <div className="md:col-span-2 grid grid-rows-2 gap-2">
                            <ScrollReveal delay={100}>
                                <CollectionCard
                                    name={g(cms, 'col4_name')}
                                    category={g(cms, 'col4_category')}
                                    link={g(cms, 'col4_link')}
                                    image={g(cms, 'col4_image')}
                                    aspectClass="aspect-[4/3]"
                                />
                            </ScrollReveal>
                            <ScrollReveal delay={150}>
                                <CollectionCard
                                    name={g(cms, 'col5_name')}
                                    category={g(cms, 'col5_category')}
                                    link={g(cms, 'col5_link')}
                                    image={g(cms, 'col5_image')}
                                    aspectClass="aspect-[4/3]"
                                />
                            </ScrollReveal>
                        </div>
                        <ScrollReveal className="md:col-span-3">
                            <CollectionCard
                                name={g(cms, 'col6_name')}
                                category={g(cms, 'col6_category')}
                                link={g(cms, 'col6_link')}
                                image={g(cms, 'col6_image')}
                                aspectClass="aspect-[4/3]"
                            />
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                SECTION 5 — PRODUIT SIGNATURE
            ════════════════════════════════════════ */}
            <section className="bg-[#FAFAF8] border-y border-[#E8E4DC]">
                <div className="container mx-auto px-0 max-w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                        {/* Text column */}
                        <div className="flex flex-col justify-center px-8 md:px-16 xl:px-24 py-20">
                            <ScrollReveal>
                                <div className="space-y-6 max-w-md">
                                    <span className="font-oswald text-[10px] uppercase tracking-[3px] text-[#C0A76A] border border-[#C0A76A] px-3 py-1 inline-block">
                                        {g(cms, 'sig_badge')}
                                    </span>
                                    <h2 className="font-oswald leading-[1.1]">
                                        <span className="block text-4xl md:text-5xl font-light text-[#262626]">
                                            {g(cms, 'sig_title_line1')}
                                        </span>
                                        <span className="block text-4xl md:text-5xl font-bold italic text-[#C0A76A]">
                                            {g(cms, 'sig_title_line2')}
                                        </span>
                                    </h2>
                                    <p className="text-[#6B6560] leading-relaxed text-base">
                                        {g(cms, 'sig_description')}
                                    </p>
                                    <div className="border-l-2 border-[#C0A76A] pl-4 py-2 bg-[#F5F0EB]">
                                        <p className="text-sm text-[#262626] leading-relaxed">
                                            {g(cms, 'sig_warning')}
                                        </p>
                                    </div>
                                    <Link
                                        href={g(cms, 'sig_cta_link')}
                                        className="inline-flex items-center gap-2 font-oswald text-xs uppercase tracking-[2px] text-[#C0A76A] border-b border-[#C0A76A] pb-0.5 hover:text-[#262626] hover:border-[#262626] transition-colors"
                                    >
                                        {g(cms, 'sig_cta_label')} <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Image column — full bleed */}
                        <ScrollReveal className="relative min-h-[400px] lg:min-h-0 overflow-hidden">
                            <div className="absolute inset-0 bg-[#F5F0EB]">
                                <Image
                                    src={g(cms, 'sig_image')}
                                    alt={g(cms, 'sig_title_line1')}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                SECTION 6 — LA SCIENCE
            ════════════════════════════════════════ */}
            <section className="bg-[#FFFFFF] py-24 md:py-32">
                <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
                        {/* Text left */}
                        <ScrollReveal>
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <span className="font-oswald text-[11px] uppercase tracking-[4px] text-[#C0A76A]">
                                        {g(cms, 'sci_overtitle')}
                                    </span>
                                    <h2 className="font-oswald text-3xl md:text-[44px] text-[#262626] leading-[1.15]">
                                        {g(cms, 'sci_title')}
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { t: g(cms, 'sci_feature1_title'), d: g(cms, 'sci_feature1_desc') },
                                        { t: g(cms, 'sci_feature2_title'), d: g(cms, 'sci_feature2_desc') },
                                        { t: g(cms, 'sci_feature3_title'), d: g(cms, 'sci_feature3_desc') },
                                    ].map((feat, i) => (
                                        <div key={i} className="flex gap-5 items-start">
                                            <div className="w-10 h-px bg-[#C0A76A] mt-3 shrink-0" />
                                            <div>
                                                <p className="font-oswald text-sm font-bold uppercase tracking-wider text-[#262626] mb-1">
                                                    {feat.t}
                                                </p>
                                                <p className="text-sm text-[#6B6560] leading-relaxed">{feat.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-xs italic text-[#8A8578] border-t border-[#E8E4DC] pt-6">
                                    {g(cms, 'sci_footnote')}
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Image right — bleeds slightly */}
                        <ScrollReveal delay={150} className="relative aspect-[3/4] overflow-visible">
                            <div className="absolute inset-0 xl:translate-x-8 overflow-hidden">
                                <Image
                                    src={g(cms, 'sci_image')}
                                    alt={g(cms, 'sci_overtitle')}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 45vw"
                                />
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                SECTION 7 — CERTIFICATIONS BAND
            ════════════════════════════════════════ */}
            <section className="bg-[#F5F0EB] border-t border-[#C0A76A]">
                <div className="container mx-auto px-6 md:px-12 max-w-6xl py-12">
                    <ScrollReveal>
                        <div className="flex flex-wrap items-center justify-center gap-0 divide-x divide-[#E8E4DC]">
                            {[
                                g(cms, 'cert_label1'),
                                g(cms, 'cert_label2'),
                                g(cms, 'cert_label3'),
                                g(cms, 'cert_label4'),
                                g(cms, 'cert_label5'),
                            ].map((cert, i) => (
                                <div key={i} className="flex flex-col items-center px-8 md:px-12 py-4 gap-2">
                                    <span className="font-oswald text-sm font-bold text-[#8A8578] uppercase tracking-wider">
                                        {cert}
                                    </span>
                                    <div className="w-4 h-px bg-[#C0A76A]" />
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ════════════════════════════════════════
                SECTION 8 — TRANSFORMATIONS GALLERY (Carousel)
            ════════════════════════════════════════ */}
            <section className="bg-[#FAFAF8] py-24 md:py-32 overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 max-w-7xl text-center">
                    <ScrollReveal>
                        <div className="mb-6">
                            <span className="font-oswald text-[11px] uppercase tracking-[4px] text-[#C0A76A]">
                                {g(cms, 'transf_overtitle')}
                            </span>
                            <h2 className="font-oswald text-4xl md:text-[56px] text-[#262626] mt-3">
                                {g(cms, 'transf_title')}
                            </h2>
                            <div className="w-24 h-px bg-[#C0A76A] mx-auto mt-6" />
                        </div>
                    </ScrollReveal>

                    <TransformationCarousel
                        badgeText={g(cms, 'transf_badge')}
                        slides={[
                            { title: g(cms, 'transf1_title'), desc: g(cms, 'transf1_desc'), image: g(cms, 'transf1_image') },
                            { title: g(cms, 'transf2_title'), desc: g(cms, 'transf2_desc'), image: g(cms, 'transf2_image') },
                            { title: g(cms, 'transf3_title'), desc: g(cms, 'transf3_desc'), image: g(cms, 'transf3_image') },
                            { title: g(cms, 'transf4_title'), desc: g(cms, 'transf4_desc'), image: g(cms, 'transf4_image') },
                            { title: g(cms, 'transf5_title'), desc: g(cms, 'transf5_desc'), image: g(cms, 'transf5_image') },
                        ]}
                    />
                </div>
            </section>

            {/* ════════════════════════════════════════
                SECTION 9 — CTA FINAL
            ════════════════════════════════════════ */}
            <section className="bg-[#F5F0EB] border-t border-[#C0A76A] py-28 md:py-40">
                <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
                    <ScrollReveal>
                        <div className="space-y-8">
                            <span className="font-oswald text-[11px] uppercase tracking-[4px] text-[#C0A76A]">
                                {g(cms, 'cta_overtitle')}
                            </span>
                            <h2 className="font-oswald leading-[1.05]">
                                <span className="block text-4xl md:text-[64px] font-light text-[#262626]">
                                    {g(cms, 'cta_title_line1')}
                                </span>
                                <span className="block text-4xl md:text-[64px] font-bold text-[#C0A76A]">
                                    {g(cms, 'cta_title_line2')}
                                </span>
                            </h2>
                            <p className="text-[#6B6560] text-lg leading-relaxed max-w-xl mx-auto">
                                {g(cms, 'cta_subtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link
                                    href={g(cms, 'cta_btn_primary_link')}
                                    className="inline-block px-10 py-4 bg-[#C0A76A] text-white font-oswald text-xs uppercase tracking-[2px] hover:bg-[#A8914F] transition-colors duration-300"
                                >
                                    {g(cms, 'cta_btn_primary_label')}
                                </Link>
                                <Link
                                    href={g(cms, 'cta_btn_secondary_link')}
                                    className="inline-block px-10 py-4 border border-[#262626] text-[#262626] font-oswald text-xs uppercase tracking-[2px] hover:bg-[#262626] hover:text-white transition-all duration-300"
                                >
                                    {g(cms, 'cta_btn_secondary_label')}
                                </Link>
                            </div>
                            <p className="text-xs text-[#8A8578] font-oswald uppercase tracking-[2px]">
                                {g(cms, 'cta_note')}
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

        </div>
    )
}

/* ── Sub-components ── */
function CollectionCard({
    name, category, link, image, aspectClass
}: {
    name: string; category: string; link: string; image: string; aspectClass: string
}) {
    return (
        <Link href={link} className={`group relative ${aspectClass} overflow-hidden block bg-[#F5F0EB] border border-[#E8E4DC] w-full`}>
            <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#262626]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <span className="font-oswald text-[9px] uppercase tracking-[3px] text-[#C0A76A]">{category}</span>
                <p className="font-oswald text-lg uppercase text-white mt-1">{name}</p>
            </div>
            {/* Always-visible label fallback */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#FAFAF8]/90 py-3 px-4 group-hover:opacity-0 transition-opacity duration-300">
                <p className="font-oswald text-xs uppercase tracking-widest text-[#262626]">{name}</p>
            </div>
        </Link>
    )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h4 className="font-oswald text-[10px] uppercase tracking-[3px] text-[#262626]">{title}</h4>
            <div className="space-y-2.5">{children}</div>
        </div>
    )
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="block text-sm text-[#6B6560] hover:text-[#C0A76A] transition-colors">
            {label}
        </Link>
    )
}
