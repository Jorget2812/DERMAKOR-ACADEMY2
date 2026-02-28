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

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on path change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    // Settings
    const logoText = settings.logo_text || 'DERMAKOR SWISS'
    const logoSubtitle = settings.logo_subtitle || 'Importateur Officiel KRX Aesthetics'
    const showSearch = settings.header_show_search === true || settings.header_show_search === "true"
    const showLang = settings.header_show_language_selector === true || settings.header_show_language_selector === "true"
    const accentColor = settings.header_accent_color || '#C0A76A'

    // Filter top-level items
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
                style={{
                    borderBottomColor: scrolled ? undefined : 'transparent'
                }}
            >
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo Section */}
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
                                    <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-muted-foreground mt-1">
                                        {logoSubtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
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

                    {/* Actions */}
                    <div className="flex items-center space-x-6 sm:space-x-8">
                        {showSearch && (
                            <button className="flex items-center gap-2 text-primary/70 hover:text-accent transition-all group">
                                <Search className="w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
                            </button>
                        )}

                        <div className="flex items-center space-x-4 sm:space-x-6">
                            {user && <CartButton />}
                            {showLang && (
                                <div className="h-6 w-px bg-border/60 hidden sm:block" />
                            )}
                            {showLang && (
                                <ClientOnly><LanguageSwitcher /></ClientOnly>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 -mr-2 text-primary hover:text-accent transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col pt-24"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-6 right-6 p-2 text-primary hover:text-accent transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X size={28} />
                            </button>

                            <div className="flex-grow overflow-y-auto px-8 pb-12">
                                <div className="space-y-6">
                                    {topItems.map(item => {
                                        const subItems = items.filter(sub => sub.parent_id === item.id && sub.is_visible)
                                        const label = getItemLabel(item)

                                        if (item.is_dropdown && subItems.length > 0) {
                                            return (
                                                <div key={item.id} className="space-y-4">
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent border-b border-accent/10 pb-2">
                                                        {label}
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 pl-4">
                                                        {subItems.map(sub => (
                                                            <Link
                                                                key={sub.id}
                                                                href={sub.link as any || '/'}
                                                                className="text-sm font-medium text-primary/70 hover:text-accent py-1"
                                                            >
                                                                {getItemLabel(sub)}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <Link
                                                key={item.id}
                                                href={item.link as any || '/'}
                                                className={`block text-lg font-bold uppercase tracking-[0.15em] border-b border-slate-50 pb-4 ${item.style === 'outline' ? 'text-accent' : 'text-primary'
                                                    }`}
                                            >
                                                {label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Mobile Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Réseaux Sociaux</span>
                                    <div className="h-px bg-slate-200 flex-grow mx-4" />
                                </div>
                                <div className="flex gap-4">
                                    {/* Social placeholders if needed */}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
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
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
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
