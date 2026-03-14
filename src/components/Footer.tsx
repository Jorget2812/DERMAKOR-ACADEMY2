'use client'

import { Link } from '@/navigation'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
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
        footer_tagline: 'Importateur Officiel KRX Aesthetics - Suisse',
        footer_col1_title: 'Navigation',
        footer_col1_link1_label: 'Accueil', footer_col1_link1_href: '/',
        footer_col1_link2_label: 'Boutique', footer_col1_link2_href: '/shop',
        footer_col1_link3_label: 'Formations', footer_col1_link3_href: '/academy-info',
        footer_col1_link4_label: 'A Propos', footer_col1_link4_href: '/about',
        footer_col2_title: 'Produits',
        footer_col2_link1_label: 'Meso Booster', footer_col2_link1_href: '/shop/category/mesobooster-ampoule',
        footer_col2_link2_label: 'Soin Peeling', footer_col2_link2_href: '/shop/category/peeling',
        footer_col2_link3_label: 'Creme', footer_col2_link3_href: '/shop/category/creme',
        footer_col2_link4_label: 'Green Sea Peel', footer_col2_link4_href: '/shop/category/green-sea-peel',
        footer_col3_title: 'Support',
        footer_col3_link1_label: "Demande d'Acces", footer_col3_link1_href: '/pro',
        footer_col3_link2_label: 'FAQ', footer_col3_link2_href: '/faq',
        footer_col3_link3_label: 'Contact', footer_col3_link3_href: '/contact',
        footer_col4_title: 'Contact',
        footer_phone: '+41 78 326 71 51',
        footer_email: 'info@dermakorswiss.com',
        footer_address1: 'Chem. des Champs Courbes 1, 1024 Ecublens, Suisse',
        footer_hours: 'Lun-Ven : 9h00 - 16h00',
        footer_copyright: '2026 DermaKor Swiss Sarl. Made in Switzerland.',
    }

    const g = (key: string) => cms[key] || DEFAULTS[key] || ''

    return (
        <footer style={{ background: '#F7F4F0' }} className="border-t border-[#E0D9CF]">
            <div className="container mx-auto px-6 max-w-7xl pt-16 pb-12">

                {/* Brand Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14 pb-10 border-b border-[#C0A76A]/15">
                    <div>
                        <Link href="/" className="font-oswald text-3xl font-bold tracking-[6px] text-[#1A1814] uppercase hover:text-[#C0A76A] transition-colors duration-300">
                            DERMAKOR <span className="text-[#C0A76A]">SWISS</span>
                        </Link>
                        <p className="font-oswald text-[10px] uppercase tracking-[3px] text-[#8A8578] mt-2">
                            {g('footer_tagline')}
                        </p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 sm:gap-y-12">

                    <div>
                        <h4 className="font-oswald text-[9px] uppercase tracking-[4px] text-[#C0A76A] font-bold mb-6">
                            {g('footer_col1_title')}
                        </h4>
                        <div className="flex flex-col gap-3.5">
                            {[1,2,3,4].map(n => (
                                <Link key={n} href={g(`footer_col1_link${n}_href`)}
                                    className="text-[13px] text-[#5C5650] hover:text-[#C0A76A] hover:translate-x-1 transition-all duration-200 inline-block">
                                    {g(`footer_col1_link${n}_label`)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-oswald text-[9px] uppercase tracking-[4px] text-[#C0A76A] font-bold mb-6">
                            {g('footer_col2_title')}
                        </h4>
                        <div className="flex flex-col gap-3.5">
                            {[1,2,3,4].map(n => (
                                <Link key={n} href={g(`footer_col2_link${n}_href`)}
                                    className="text-[13px] text-[#5C5650] hover:text-[#C0A76A] hover:translate-x-1 transition-all duration-200 inline-block">
                                    {g(`footer_col2_link${n}_label`)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-oswald text-[9px] uppercase tracking-[4px] text-[#C0A76A] font-bold mb-6">
                            {g('footer_col3_title')}
                        </h4>
                        <div className="flex flex-col gap-3.5">
                            {[1,2,3].map(n => (
                                <Link key={n} href={g(`footer_col3_link${n}_href`)}
                                    className="text-[13px] text-[#5C5650] hover:text-[#C0A76A] hover:translate-x-1 transition-all duration-200 inline-block">
                                    {g(`footer_col3_link${n}_label`)}
                                </Link>
                            ))}
                            <Link href="/cgv" className="text-[13px] text-[#5C5650] hover:text-[#C0A76A] hover:translate-x-1 transition-all duration-200 inline-block">CGV</Link>
                            <Link href="/confidentialite" className="text-[13px] text-[#5C5650] hover:text-[#C0A76A] hover:translate-x-1 transition-all duration-200 inline-block">Confidentialite</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-oswald text-[9px] uppercase tracking-[4px] text-[#C0A76A] font-bold mb-6">
                            {g('footer_col4_title')}
                        </h4>
                        <div className="flex flex-col gap-4">
                            <a href={`tel:${g('footer_phone').replace(/\s/g,'')}`} className="flex items-center gap-2.5 group">
                                <Phone size={13} className="text-[#C0A76A] shrink-0" />
                                <span className="text-[13px] text-[#5C5650] group-hover:text-[#C0A76A] transition-colors">{g('footer_phone')}</span>
                            </a>
                            <a href={`mailto:${g('footer_email')}`} className="flex items-center gap-2.5 group">
                                <Mail size={13} className="text-[#C0A76A] shrink-0" />
                                <span className="text-[13px] text-[#5C5650] group-hover:text-[#C0A76A] transition-colors break-all">{g('footer_email')}</span>
                            </a>
                            <div className="flex items-start gap-2.5">
                                <MapPin size={13} className="text-[#C0A76A] shrink-0 mt-0.5" />
                                <span className="text-[13px] text-[#5C5650] leading-relaxed">{g('footer_address1')}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock size={13} className="text-[#C0A76A] shrink-0" />
                                <span className="text-[13px] text-[#5C5650]">{g('footer_hours')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ background: '#EDE8E2' }} className="border-t border-[#C0A76A]/10">
                <div className="container mx-auto px-6 max-w-7xl py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] text-[#8A8578] font-oswald uppercase tracking-wider text-center sm:text-left">
                        {g('footer_copyright')}
                    </p>
                    <div className="flex items-center gap-2.5">
                        <div className="bg-white rounded px-2.5 py-1.5 shadow-sm border border-[#E0D9CF]">
                            <span className="text-[11px] font-black" style={{color:'#1A1F71', fontFamily:'Arial', letterSpacing:'1px'}}>VISA</span>
                        </div>
                        <div className="bg-white rounded px-2 py-1.5 shadow-sm border border-[#E0D9CF] flex items-center">
                            <div className="w-4 h-4 rounded-full" style={{background:'#EB001B'}} />
                            <div className="w-4 h-4 rounded-full -ml-2" style={{background:'#F79E1B', opacity: 0.9}} />
                        </div>
                        <div className="rounded px-2.5 py-1.5 shadow-sm" style={{background:'#000'}}>
                            <span className="text-[10px] font-black text-white tracking-wider">TWINT</span>
                        </div>
                        <div className="bg-white rounded px-2.5 py-1.5 shadow-sm border border-[#E0D9CF]">
                            <span className="text-[10px] font-black" style={{color:'#003087'}}>Pay</span><span className="text-[10px] font-black" style={{color:'#009cde'}}>Pal</span>
                        </div>
                        <div className="rounded px-2.5 py-1.5 shadow-sm" style={{background:'#FFCC00'}}>
                            <span className="text-[10px] font-black text-black">PostFinance</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}