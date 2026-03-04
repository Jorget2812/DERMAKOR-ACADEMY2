'use client'

import React, { useState, useEffect } from 'react'
import { Link, usePathname } from '@/navigation'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu, X, Search, ChevronDown, GraduationCap,
    ArrowRight, Globe
} from 'lucide-react'
import { ClientOnly } from './ui/client-only'
import { LanguageSwitcher } from './LanguageSwitcher'
import { CartButton } from '@/domains/commerce/components/CartButton'
import type { NavItem } from '@/domains/admin/nav-actions'

interface HeaderClientProps {
    items: NavItem[]
    settings: Record<string, any>
    user: any
}

export function HeaderClient({ items, settings, user }: HeaderClientProps) {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const locale = useLocale()

    useEffect(() => {
        const handleScroll = () => { setScrolled(window.scrollY > 50) }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [mobileMenuOpen])

    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    const logoText = settings.logo_text || 'DERMAKOR SWISS'
    const logoSubtitle = settings.logo_subtitle || 'Importateur Officiel KRX Aesthetics'
    const showSearch = settings.header_show_search === true || settings.header_show_search === "true"
    const showLang = settings.header_show_language_selector === true || settings.header_show_language_selector === "true"
    const accentColor = settings.header_accent_color || '#C0A76A'

    const topItems = items.filter(item => !item.parent_id && item.is_visible)

    const getItemLabel = (item: NavItem) => {
        if (locale === 'de') return item.label_de || item.label_fr
        if (locale === 'it') return item.label_it || item.label_fr
        return item.label_fr
    }

    return (
        <>
            <header
                className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${scrolled
                    ? 'h-20 bg-white/95 backdrop-blur-xl border-border/40'
                    : 'h-24 bg-white/80 backdrop-blur-xl border-transparent'
                    }`}
                style={{ borderBottomColor: scrolled ? undefined : 'transparent' }}
            >
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex flex-col group">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-500">
                                <GraduationCap size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-[0.15em] uppercase text-primary leading-none">
                                    {logoText.split(' ').map((word: string, i: number, arr: string[]) => (
                                        <span key={i} className={i === arr.length - 1 ? 'text-accent' : ''}>
                                            {word}{i < arr.length - 1 ? ' ' : ''}
                                        </span>
                                    ))}
                                </span>
                                {logoSubtitle && (
                                    <span className="hidden sm:block text-[8px] font-medium uppercase tracking-[0.2em] text-muted-foreground mt-1">
                                        {logoSubtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70">
                        {topItems.map(item => {
                            const subItems = items.filter(sub => sub.parent_id === item.id && sub.is_visible)
                            const label = getItemLabel(item)
                            const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link || ''))

                            if (item.is_dropdown && subItems.length > 0) {
                                return (
                                    <DropdownItem
                                        key={item.id}
                                        label={label}
                                        items={subItems}
                                        locale={locale}
                                        getItemLabel={getItemLabel}
                                    />
                                )
                            }

                            if (item.style === 'outline') {
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.link as any || '/'}
                                        className="text-accent border border-accent/20 px-6 py-2.5 rounded-full bg-accent/5 hover:bg-accent hover:text-white transition-all duration-300 font-bold"
                                    >
                                        {label}
                                    </Link>
                                )
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.link as any || '/'}
                                    className={`hover:text-accent transition-all duration-300 hover:tracking-[0.3em] ${isActive ? 'text-accent' : ''}`}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="flex items-center space-x-6 sm:space-x-8">
                        {showSearch && (
                            <button className="flex items-center gap-2 text-primary/70 hover:text-accent transition-all group">
                                <Search className="w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
                            </button>
                        )}
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            {user && <CartButton />}
                            {showLang && <div className="h-6 w-px bg-border/60 hidden sm:block" />}
                            {showLang && <ClientOnly><LanguageSwitcher /></ClientOnly>}
                        </div>
                        <button
                            className="lg:hidden p-2 -mr-2 text-primary hover:text-accent transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="fixed inset-0 z-[100] lg:hidden"
                            style={{ background: 'rgba(10,8,6,0.55)', backdropFilter: 'blur(12px)' }}
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 260, mass: 0.8 }}
                            className="fixed right-0 top-0 bottom-0 z-[101] w-[88%] max-w-sm lg:hidden flex flex-col"
                            style={{
                                background: 'rgba(255,253,250,0.97)',
                                backdropFilter: 'blur(32px) saturate(180%)',
                                boxShadow: '-24px 0 80px rgba(0,0,0,0.18)',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <motion.button
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(192,167,106,0.1)' }}
                                onClick={() => setMobileMenuOpen(false)}
                                whileTap={{ scale: 0.92 }}
                            >
                                <X size={18} className="text-[#C0A76A]" />
                            </motion.button>

                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.4 }}
                                className="px-8 pt-8 pb-6 border-b border-[#C0A76A]/10"
                            >
                                <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#C0A76A]">Dermakor Swiss</p>
                                <p className="text-[8px] uppercase tracking-[0.2em] text-[#8A8578] mt-0.5">Importateur Officiel KRX Aesthetics</p>
                            </motion.div>

                            <div className="flex-grow overflow-y-auto px-8 py-8">
                                <div className="space-y-1">
                                    {topItems.map((item, i) => {
                                        const subItems = items.filter(sub => sub.parent_id === item.id && sub.is_visible)
                                        const label = getItemLabel(item)
                                        const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link || ''))

                                        if (item.is_dropdown && subItems.length > 0) {
                                            return (
                                                <MobileDropdownItem
                                                    key={item.id}
                                                    label={label}
                                                    subItems={subItems}
                                                    index={i}
                                                    getItemLabel={getItemLabel}
                                                />
                                            )
                                        }

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: 24 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.18 + i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                                            >
                                                <Link href={item.link as any || '/'} className="flex items-center justify-between py-4 border-b border-[#3D3830]/5 group">
                                                    <span className={`text-[15px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${
                                                        isActive ? 'text-[#C0A76A]' : 'text-[#3D3830] group-hover:text-[#C0A76A]'
                                                    }`}>
                                                        {label}
                                                    </span>
                                                    <motion.div
                                                        initial={false}
                                                        animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -8 }}
                                                        className="w-1.5 h-1.5 rounded-full bg-[#C0A76A]"
                                                    />
                                                </Link>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.4 }}
                                className="p-7 border-t border-[#C0A76A]/10 space-y-4"
                                style={{ background: 'rgba(192,167,106,0.04)' }}
                            >
                                {showLang && (
                                    <div className="flex items-center gap-3">
                                        <Globe size={13} className="text-[#C0A76A]/60" />
                                        <ClientOnly><LanguageSwitcher /></ClientOnly>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C0A76A]">Contact</p>
                                    <a href="tel:+41783267151" className="block text-[12px] text-[#8A8578] hover:text-[#C0A76A] transition-colors">+41 78 326 71 51</a>
                                    <a href="mailto:info@dermakorswiss.com" className="block text-[12px] text-[#8A8578] hover:text-[#C0A76A] transition-colors">info@dermakorswiss.com</a>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}


function MobileDropdownItem({ label, subItems, index, getItemLabel }: {
    label: string,
    subItems: NavItem[],
    index: number,
    getItemLabel: (item: NavItem) => string
}) {
    const [open, setOpen] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 + index * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 border-b border-[#3D3830]/5"
            >
                <span className="text-[15px] font-bold uppercase tracking-[0.12em] text-[#3D3830]">
                    {label}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown size={16} className="text-[#C0A76A]" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <div className="pl-4 border-l border-[#C0A76A]/20 ml-1 py-2 space-y-0.5">
                            {subItems.map((sub) => (
                                <Link
                                    key={sub.id}
                                    href={sub.link as any || '/'}
                                    className="flex items-center justify-between py-3 group"
                                >
                                    <span className="text-[14px] font-medium text-[#3D3830]/70 group-hover:text-[#C0A76A] transition-colors duration-200">
                                        {getItemLabel(sub)}
                                    </span>
                                    <ArrowRight size={12} className="text-[#C0A76A]/0 group-hover:text-[#C0A76A] -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
function DropdownItem({ label, items, locale, getItemLabel }: {
    label: string,
    items: NavItem[],
    locale: string,
    getItemLabel: (item: NavItem) => string
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button className={`flex items-center gap-1.5 transition-all duration-300 ${open ? 'text-accent' : ''}`}>
                {label}
                <ChevronDown size={12} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-60"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />
                            <div className="relative z-10 space-y-0.5">
                                {items.map(item => (
                                    <Link
                                        key={item.id}
                                        href={item.link as any || '/'}
                                        target={item.open_in_new_tab ? '_blank' : undefined}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-accent/5 hover:text-accent group transition-all"
                                    >
                                        <span className="text-[11px] font-semibold">{getItemLabel(item)}</span>
                                        <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
