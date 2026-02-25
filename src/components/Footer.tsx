'use client'

import { Link } from '@/navigation'
import Image from 'next/image'
import { Globe, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import { getPageContents, type Locale } from '@/domains/admin/cms-actions'

export function Footer() {
    const locale = useLocale()
    const [cms, setCms] = useState<Record<string, string>>({})

    useEffect(() => {
        const loadCms = async () => {
            const data = await getPageContents('home', locale as Locale)
            setCms(data)
        }
        loadCms()
    }, [locale])

    const DEFAULTS: Record<string, string> = {
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
        footer_address1: 'Chem. des Champs Courbes 1, 1024 Ecublens, Suisse',
        footer_hours: 'Lun–Ven : 9h00 – 16h00',
        footer_copyright: '© 2026 DermaKor Swiss Sàrl. Made in Switzerland 🇨🇭',
    }

    const g = (key: string) => cms[key] || DEFAULTS[key] || ''

    return (
        <footer className="bg-[#F5F0EB] border-t border-[#E8E4DC] pt-16 pb-8">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Ligne 1: Logo & Brand */}
                <div className="text-center mb-12">
                    <Link href="/" className="font-oswald text-2xl font-bold tracking-[6px] text-[#C0A76A] uppercase">
                        {g('footer_brand')}
                    </Link>
                    <p className="font-oswald text-[11px] uppercase tracking-[3px] text-[#8A8578] mt-3">
                        {g('footer_tagline')}
                    </p>
                    <div className="w-24 h-px bg-[#C0A76A] mx-auto mt-8 opacity-40" />
                </div>

                {/* Ligne 2: 4 Colonnes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 mb-16">
                    {/* Navigation */}
                    <FooterCol title={g('footer_col1_title')}>
                        <FooterLink href={g('footer_col1_link1_href')} label={g('footer_col1_link1_label')} />
                        <FooterLink href={g('footer_col1_link2_href')} label={g('footer_col1_link2_label')} />
                        <FooterLink href={g('footer_col1_link3_href')} label={g('footer_col1_link3_label')} />
                        <FooterLink href={g('footer_col1_link4_href')} label={g('footer_col1_link4_label')} />
                    </FooterCol>

                    {/* Produits */}
                    <FooterCol title={g('footer_col2_title')}>
                        <FooterLink href={g('footer_col2_link1_href')} label={g('footer_col2_link1_label')} />
                        <FooterLink href={g('footer_col2_link2_href')} label={g('footer_col2_link2_label')} />
                        <FooterLink href={g('footer_col2_link3_href')} label={g('footer_col2_link3_label')} />
                        <FooterLink href={g('footer_col2_link4_href')} label={g('footer_col2_link4_label')} />
                    </FooterCol>

                    {/* Support */}
                    <FooterCol title={g('footer_col3_title')}>
                        <FooterLink href={g('footer_col3_link1_href')} label={g('footer_col3_link1_label')} />
                        <FooterLink href={g('footer_col3_link2_href')} label={g('footer_col3_link2_label')} />
                        <FooterLink href={g('footer_col3_link3_href')} label={g('footer_col3_link3_label')} />
                        <FooterLink href="/cgv" label="CGV" />
                        <FooterLink href="/confidentialite" label="Confidentialité" />
                    </FooterCol>

                    {/* Contact */}
                    <FooterCol title={g('footer_col4_title')}>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone size={14} className="text-[#C0A76A] mt-1 shrink-0" />
                                <span className="text-sm text-[#6B6560]">{g('footer_phone')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={14} className="text-[#C0A76A] mt-1 shrink-0" />
                                <span className="text-sm text-[#6B6560] leading-tight break-all">{g('footer_email')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={14} className="text-[#C0A76A] mt-1 shrink-0" />
                                <span className="text-sm text-[#6B6560] leading-relaxed italic">{g('footer_address1')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock size={14} className="text-[#C0A76A] mt-1 shrink-0" />
                                <span className="text-sm text-[#6B6560]">{g('footer_hours')}</span>
                            </div>
                        </div>
                    </FooterCol>
                </div>

                {/* Ligne Separator */}
                <div className="w-full h-px bg-[#C0A76A] opacity-20 mb-8" />

                {/* Ligne 3: Copyright & Payments */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] text-[#8A8578] font-oswald uppercase tracking-wider text-center md:text-left">
                        {g('footer_copyright')}
                    </p>

                    <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Fake payment icons placeholder with simple text labels or small images if available */}
                        <div className="flex gap-3">
                            <div className="text-[10px] font-bold border border-[#6B6560] px-2 py-0.5 rounded text-[#6B6560]">VISA</div>
                            <div className="text-[10px] font-bold border border-[#6B6560] px-2 py-0.5 rounded text-[#6B6560]">MASTERCARD</div>
                            <div className="text-[10px] font-bold border border-[#6B6560] px-2 py-0.5 rounded text-[#6B6560]">TWINT</div>
                            <div className="text-[10px] font-bold border border-[#6B6560] px-2 py-0.5 rounded text-[#6B6560]">PAYPAL</div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <h4 className="font-oswald text-[10px] uppercase tracking-[4px] text-[#262626] font-bold border-b border-[#C0A76A]/20 pb-2 inline-block min-w-[100px]">
                {title}
            </h4>
            <div className="flex flex-col gap-3">{children}</div>
        </div>
    )
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="text-sm text-[#6B6560] hover:text-[#C0A76A] transition-all duration-300 hover:translate-x-1 inline-block">
            {label}
        </Link>
    )
}
