'use client'
import { motion } from 'framer-motion'
import { use } from 'react'
import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import {
    UserCheck,
    BookOpen,
    Award,
    Package,
    FileText,
    HeartHandshake,
    ChevronRight,
    Phone,
    Star,
    GraduationCap
} from 'lucide-react'
import { getPageContents, type Locale } from '@/domains/admin/cms-actions'
import { useState, useEffect, useMemo } from 'react'
import { ClientOnly } from '@/components/ui/client-only'
import * as LucideIcons from 'lucide-react'
import { CmsImageWithOverlay } from '@/components/CmsImageWithOverlay'

export const dynamic = 'force-dynamic'

const DEFAULTS: Record<string, string> = {
    // Hero
    formations_hero_overtitle: "DISTRIBUTEUR OFFICIEL SUISSE",
    formations_hero_title: "Académie Prestige",
    formations_hero_title2: "Aesthetics & E-Learning",
    formations_hero_subtitle: "Maîtrisez les protocoles les plus avancés de la dermo-cosmétique coréenne KRX Aesthetics. Des formations de grade clinique conçues pour l'excellence des professionnels suisses.",

    // Avantages
    formations_advantages_overtitle: "POURQUOI CHOISIR DERMAKOR ACADEMY?",
    formations_advantages_count: "3",
    formations_advantage1_title: "Expertise Clinique",
    formations_advantage1_icon: "Star",
    formations_advantage1_desc: "Protocoles KRX certifiés et adaptés aux standards exigeants du marché esthétique helvétique.",
    formations_advantage2_title: "Flexibilité Totale",
    formations_advantage2_icon: "GraduationCap",
    formations_advantage2_desc: "Plateforme 100% en ligne disponible 24/7. Apprenez à votre rythme depuis votre institut.",
    formations_advantage3_title: "Accompagnement VIP",
    formations_advantage3_icon: "Award",
    formations_advantage3_desc: "Support post-formation illimité et accès direct à nos experts pour toutes vos questions.",

    // Formations Defaults
    formations_count: "3",

    // Card 1: Green Sea Peel
    formation_1_title: "Green Sea Peel Expert",
    formation_1_description: "Le peeling naturel n°1 mondial à base de spicules d'algues. Apprenez à transformer radicalement la peau sans acide ni produits chimiques.",
    formation_1_badge: "FORMATION STAR",
    formation_1_label: "Traitement Signature",
    formation_1_price: "450",
    formation_1_currency: "CHF",
    formation_1_image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc206e?auto=format&fit=crop&q=80&w=2000",
    formation_1_info_title: "Informations Essentielles",
    formation_1_info_items: "Élimination des toxines|Régénération cellulaire profonde|Traitement 100% naturel|Résultats visibles dès J+7",
    formation_1_included_title: "Inclus dans la formation",
    formation_1_included_items: "Certificat officiel KRX|Livret technique digital|Accès au groupe privé|Suivi post-formation",
    formation_1_level: "Avancé",
    formation_1_level_stars: "3",
    formation_1_prerequisites: "Professionnel(le) de l'esthétique",
    formation_1_cta_text: "S'inscrire Maintenant",
    formation_1_cta_link: "/shop/product/formation-green-sea-peel",

    // Card 2
    formation_2_title: "Meso Booster Ampoules",
    formation_2_price: "380",
    formation_2_currency: "CHF",
    formation_2_level_stars: "2",
    formation_2_cta_text: "S'inscrire Maintenant",

    // Card 3
    formation_3_title: "KRX Skin Specialist",
    formation_3_price: "550",
    formation_3_currency: "CHF",
    formation_3_level_stars: "3",
    formation_3_cta_text: "S'inscrire Maintenant",

    // Engagements
    formations_engagements_title: "L'Excellence DermaKor",
    formations_engagements_subtitle: "Votre réussite est notre standard de qualité",
    formations_engagements_count: "4",
    formations_engagement1_title: "Certificat Officiel",
    formations_engagement1_icon: "Award",
    formations_engagement1_desc: "Reconnu au niveau international par KRX Aesthetics.",
    formations_engagement2_title: "Support Expert",
    formations_engagement2_icon: "Phone",
    formations_engagement2_desc: "Ligne directe avec nos formatrices certifiées.",
    formations_engagement3_title: "Accès Illimité",
    formations_engagement3_icon: "History",
    formations_engagement3_desc: "Contenu disponible à vie pour vos révisions.",
    formations_engagement4_title: "Protocoles Suisses",
    formations_engagement4_icon: "Package",
    formations_engagement4_desc: "Documentation technique en Français/Allemand/Italien.",

    // CTA
    formations_cta_title: "Élevez Votre Niveau",
    formations_cta_subtitle: "Rejoignez l'élite suisse KRX",
    formations_cta_desc: "Ne laissez pas vos clientes attendre. Apportez l'innovation coréenne dans votre institut dès aujourd'hui.",
    formations_cta_button_text: "Découvrir la Boutique",
    formations_cta_button_link: "/shop",
    formations_cta_phone: "+41 78 326 71 51",
}

export default function AcademyInfoPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params)
    const [content, setContent] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        async function loadContent() {
            try {
                const data = await getPageContents('formations', (locale || 'fr') as Locale)
                if (mounted) {
                    setContent(data)
                }
            } catch (err) {
                console.error('[AcademyInfoPage] Error loading content:', err)
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }
        loadContent()
        return () => { mounted = false }
    }, [locale])

    const t = (key: string) => content[key] || DEFAULTS[key] || ''
    const isVisible = (section: string) => content[`formations_section_${section}_visible`] !== 'false'

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
            <div className="w-12 h-12 border-4 border-[#C0A76A] border-t-transparent rounded-full animate-spin" />
        </div>
    }

    const cardCount = parseInt(t('formations_count') || '0')
    const advantageCount = parseInt(t('formations_advantages_count') || '0')
    const engagementCount = parseInt(t('formations_engagements_count') || '0')

    return (
        <ClientOnly>
            <div className="flex flex-col w-full bg-[#FDFCFB] text-[#262626] font-inter overflow-x-hidden pt-20">

                {/* SECTION 1: HERO */}
                {isVisible('hero') && (
                    <section className="relative py-16 md:py-32 lg:py-48 px-5 text-center border-b border-[#E8E4DC] overflow-hidden min-h-[500px] flex items-center justify-center">
                        <CmsImageWithOverlay
                            src={t('formations_hero_bg')}
                            alt="Academy Hero"
                            className="absolute inset-0 z-0"
                            sizes="100vw"
                            overlayTitle={content['formations_hero_bg_overlay_title']}
                            overlaySubtitle={content['formations_hero_bg_overlay_subtitle']}
                            overlayCtaText={content['formations_hero_bg_overlay_cta_text']}
                            overlayCtaLink={content['formations_hero_bg_overlay_cta_link']}
                            overlayPosition={content['formations_hero_bg_overlay_position']}
                            overlayDark={content['formations_hero_bg_overlay_dark'] || '1'}
                            fallbackText="Academy Background"
                        />
                        {/* Semi-transparent overlay if CMS overlay title/subtitle are not present */}
                        {!(content['formations_hero_bg_overlay_title'] || content['formations_hero_bg_overlay_subtitle']) && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-[5]" />
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative max-w-4xl mx-auto space-y-10 z-10"
                        >
                            <span className="block font-oswald text-[12px] text-[#C0A76A] tracking-[5px] uppercase font-medium">
                                {t('formations_hero_overtitle')}
                            </span>
                            <h1 className="flex flex-col gap-4">
                                <span className="font-oswald text-3xl md:text-5xl lg:text-7xl xl:text-8xl text-[#262626] uppercase leading-[1] tracking-tight font-light">
                                    {t('formations_hero_title')}
                                </span>
                                <span className="font-oswald text-3xl md:text-5xl lg:text-7xl xl:text-8xl text-[#C0A76A] uppercase leading-[1] tracking-tight font-bold italic">
                                    {t('formations_hero_title2')}
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl lg:text-2xl text-[#6B6560] max-w-2xl mx-auto leading-relaxed font-light">
                                {t('formations_hero_subtitle')}
                            </p>
                            <div className="w-20 h-px bg-[#C0A76A] mx-auto mt-12" />
                        </motion.div>
                    </section>
                )}

                {/* SECTION 2: AVANTAGES */}
                {isVisible('advantages') && (
                    <section className="py-16 md:py-32 bg-white container mx-auto px-5 md:px-6">
                        <div className="text-center mb-12 md:mb-20">
                            <span className="font-oswald text-[11px] text-[#C0A76A] tracking-[4px] uppercase font-bold">
                                {t('formations_advantages_overtitle')}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {Array.from({ length: advantageCount }).map((_, i) => (
                                <AdvantageCard
                                    key={i}
                                    icon={t(`formations_advantage${i + 1}_icon`)}
                                    title={t(`formations_advantage${i + 1}_title`)}
                                    desc={t(`formations_advantage${i + 1}_desc`)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* SECTION 3: FORMATIONS */}
                {isVisible('programmes') && (
                    <section className="py-12 md:py-24 bg-white container mx-auto px-5 md:px-6 space-y-24 md:space-y-48">
                        {Array.from({ length: cardCount }).map((_, i) => (
                            <FormationBlock
                                key={i}
                                index={i + 1}
                                isEven={i % 2 !== 0}
                                content={content}
                                t={t}
                            />
                        ))}
                    </section>
                )}

                {/* SECTION 4: NOS ENGAGEMENTS */}
                {isVisible('engagements') && (
                    <section className="bg-[#F5F0EB] py-16 md:py-32 border-y border-[#E8E4DC]">
                        <div className="container mx-auto px-5 md:px-6">
                            <div className="text-center mb-12 md:mb-20 space-y-6">
                                <h2 className="font-oswald text-3xl md:text-5xl uppercase text-[#262626] tracking-tight">
                                    {t('formations_engagements_title')}
                                </h2>
                                <p className="text-[#6B6560] font-oswald text-xs uppercase tracking-[3px]">{t('formations_engagements_subtitle')}</p>
                                <div className="w-16 h-px bg-[#C0A76A] mx-auto" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {Array.from({ length: engagementCount }).map((_, i) => (
                                    <EngagementCard
                                        key={i}
                                        icon={t(`formations_engagement${i + 1}_icon`)}
                                        title={t(`formations_engagement${i + 1}_title`)}
                                        desc={t(`formations_engagement${i + 1}_desc`)}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* SECTION 5: CTA FINAL */}
                {isVisible('cta') && (
                    <section className="bg-white py-20 md:py-40 px-5 md:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto text-center space-y-8 md:space-y-10"
                        >
                            <div className="space-y-4">
                                <h2 className="font-oswald text-3xl md:text-5xl lg:text-7xl uppercase text-[#262626] tracking-tight">
                                    {t('formations_cta_title')}
                                </h2>
                                <h3 className="font-oswald text-2xl text-[#C0A76A] italic font-light tracking-[2px]">
                                    {t('formations_cta_subtitle')}
                                </h3>
                            </div>
                            <p className="text-[#6B6560] leading-relaxed text-lg lg:text-xl max-w-2xl mx-auto font-light">
                                {t('formations_cta_desc')}
                            </p>
                            <div className="pt-8 flex flex-col items-center gap-10">
                                <Link href={t('formations_cta_button_link')} className="w-full sm:w-auto">
                                    <Button className="w-full sm:min-w-[300px] h-14 md:h-16 px-16 bg-[#262626] text-white font-oswald text-xs uppercase tracking-[3px] rounded-none hover:bg-[#C0A76A] transition-all duration-500 hover:shadow-2xl tap-scale">
                                        {t('formations_cta_button_text')}
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-6 text-[#262626] font-oswald text-[11px] uppercase tracking-[2.5px] border-t border-[#E8E4DC] pt-8">
                                    <span>Support & Info:</span>
                                    <a href={`tel:${t('formations_cta_phone')}`} className="font-bold flex items-center gap-2 hover:text-[#C0A76A] transition-colors group">
                                        <div className="w-8 h-8 rounded-full border border-[#E8E4DC] flex items-center justify-center group-hover:bg-[#C0A76A] group-hover:border-[#C0A76A] group-hover:text-white transition-all">
                                            <Phone size={12} />
                                        </div>
                                        {t('formations_cta_phone')}
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}
            </div>
        </ClientOnly>
    )
}

function DynamicIcon({ name, ...props }: { name: string, [key: string]: any }) {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle
    return <Icon {...props} />
}

function AdvantageCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="group flex flex-col items-center text-center space-y-6"
        >
            <div className="w-20 h-20 bg-[#F9F6F3] border border-[#E8E4DC] rounded-full flex items-center justify-center text-[#262626] group-hover:bg-[#C0A76A] group-hover:border-[#C0A76A] group-hover:text-white transition-all duration-500 shadow-sm">
                <DynamicIcon name={icon} size={32} strokeWidth={1} />
            </div>
            <div className="space-y-3">
                <h3 className="font-oswald text-xl uppercase tracking-wider text-[#262626]">{title}</h3>
                <p className="text-sm text-[#6B6560] leading-relaxed font-light max-w-xs mx-auto">{desc}</p>
            </div>
        </motion.div>
    )
}

function EngagementCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="bg-white border border-[#E8E4DC] p-10 space-y-6 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-2 h-0 bg-[#C0A76A] transition-all duration-500 group-hover:h-full" />
            <div className="text-[#C0A76A]">
                <DynamicIcon name={icon} size={36} strokeWidth={1} />
            </div>
            <div className="space-y-4">
                <h3 className="font-oswald text-sm font-bold tracking-[3px] uppercase text-[#262626]">{title}</h3>
                <p className="text-sm text-[#6B6560] leading-relaxed font-light">{desc}</p>
            </div>
        </div>
    )
}

function FormationBlock({ index, isEven, content, t }: { index: number, isEven: boolean, content: Record<string, string>, t: (k: string) => string }) {
    const prefix = `formation_${index}`
    const title = t(`${prefix}_title`)
    const desc = t(`${prefix}_description`)
    const badge = t(`${prefix}_badge`)
    const label = t(`${prefix}_label`)
    const rawImage = t(`${prefix}_image`)

    // Logic for | separated list or newline
    const parseList = (val: string) => val ? val.split(/[|\n]/).map(s => s.trim()).filter(Boolean) : []

    const infoTitle = t(`${prefix}_info_title`) || "Informations Essentielles"
    const includedTitle = t(`${prefix}_included_title`) || "Inclus dans la formation"
    const essentials = parseList(t(`${prefix}_info_items`))
    const inclusions = parseList(t(`${prefix}_included_items`))

    const price = t(`${prefix}_price`)
    const currency = t(`${prefix}_currency`) || 'CHF'
    const ctaText = t(`${prefix}_cta_text`) || "S'inscrire Maintenant"
    const ctaLink = t(`${prefix}_cta_link`)
    const levelText = t(`${prefix}_level`)
    const levelStars = parseInt(t(`${prefix}_level_stars`) || '1')
    const prerequisites = t(`${prefix}_prerequisites`)

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col lg:flex-row items-center gap-10 md:gap-16 lg:gap-32 ${isEven ? 'lg:flex-row-reverse' : ''} max-w-7xl mx-auto`}
        >
            {/* Image side - Premium Clinical Frame */}
            <div className="w-full lg:w-[55%] relative group">
                <div className="relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-[1.02] aspect-[4/3]">
                    <div className="absolute inset-0 border-[15px] border-white z-20 pointer-events-none" />
                    <CmsImageWithOverlay
                        src={rawImage}
                        alt={title}
                        className="w-full h-full"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        overlayTitle={content[`${prefix}_image_overlay_title`]}
                        overlaySubtitle={content[`${prefix}_image_overlay_subtitle`]}
                        overlayCtaText={content[`${prefix}_image_overlay_cta_text`]}
                        overlayCtaLink={content[`${prefix}_image_overlay_cta_link`]}
                        overlayPosition={content[`${prefix}_image_overlay_position`]}
                        overlayDark={content[`${prefix}_image_overlay_dark`]}
                        fallbackText={title}
                    />
                </div>
                {/* Decorative gold reveal */}
                <div className={`absolute -z-10 w-full h-full border border-[#C0A76A]/30 top-10 ${isEven ? '-right-10' : '-left-10'} group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-700`} />
            </div>

            {/* Content side */}
            <div className="w-full lg:w-[45%] space-y-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="font-oswald text-[10px] uppercase tracking-[4px] text-[#C0A76A]">
                            {label}
                        </span>
                        {badge && (
                            <span className="text-[10px] font-bold font-oswald text-[#262626] border-b-2 border-[#C0A76A] pb-1 tracking-[2px]">
                                {badge}
                            </span>
                        )}
                    </div>

                    <h2 className="font-oswald text-3xl md:text-4xl lg:text-6xl text-[#262626] uppercase leading-[1.1] md:leading-[0.95] tracking-tight font-light">
                        {title}
                    </h2>

                    <div className="flex items-end gap-3 pt-2">
                        <span className="font-oswald text-3xl md:text-4xl lg:text-5xl font-bold text-[#C0A76A]">
                            {price}
                        </span>
                        <span className="font-oswald text-[10px] md:text-sm text-[#6B6560] mb-2 uppercase tracking-widest">{currency} HT</span>
                    </div>

                    <p className="text-[#6B6560] leading-relaxed font-light text-lg xl:text-xl">
                        {desc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-5 border-t border-[#E8E4DC] pt-8">
                        <p className="font-oswald text-[10px] uppercase tracking-[3px] text-[#262626] font-bold">{infoTitle}:</p>
                        <ul className="grid grid-cols-1 gap-4">
                            {essentials.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-[#262626] text-sm group/li">
                                    <div className="mt-1.5 w-4 h-px bg-[#C0A76A] group-hover/li:w-6 transition-all" />
                                    <span className="font-light tracking-wide">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-5 border-t border-[#E8E4DC] pt-8">
                        <p className="font-oswald text-[10px] uppercase tracking-[3px] text-[#262626] font-bold">{includedTitle}:</p>
                        <ul className="grid grid-cols-1 gap-4">
                            {inclusions.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-[#262626] text-sm group/li">
                                    <div className="mt-1.5 w-4 h-px bg-[#C0A76A] group-hover/li:w-6 transition-all" />
                                    <span className="font-light tracking-wide">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InfoBox title="Niveau">
                        <div className="flex items-center gap-1 text-[#C0A76A]">
                            <span className="text-lg font-bold">{levelText}</span>
                            <div className="flex gap-0.5 ml-2">
                                {Array.from({ length: 3 }).map((_, st) => (
                                    <Star
                                        key={st}
                                        size={12}
                                        fill={st < levelStars ? "#C0A76A" : "none"}
                                        className={st < levelStars ? "text-[#C0A76A]" : "text-[#E8E4DC]"}
                                    />
                                ))}
                            </div>
                        </div>
                    </InfoBox>
                    <InfoBox title="Prérequis">
                        <p className="text-[10px] text-[#6B6560] leading-relaxed uppercase tracking-widest">{prerequisites}</p>
                    </InfoBox>
                </div>

                <div className="pt-8">
                    <Link href={ctaLink} className="block w-full">
                        <Button className="w-full h-14 md:h-16 px-10 md:px-16 bg-transparent border border-[#262626] text-[#262626] font-oswald text-xs uppercase tracking-[3px] rounded-none hover:bg-[#262626] hover:text-white transition-all duration-500 flex items-center justify-center gap-4 group tap-scale">
                            {ctaText}
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

function InfoBox({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white border border-[#E8E4DC] p-6 rounded-lg space-y-3 shadow-sm">
            <h4 className="font-oswald text-[12px] text-[#C0A76A] uppercase tracking-widest border-b border-[#E8E4DC] pb-2">
                {title}
            </h4>
            {children}
        </div>
    )
}
