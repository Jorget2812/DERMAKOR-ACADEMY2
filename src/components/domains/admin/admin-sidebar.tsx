'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, usePathname } from '@/navigation'
import { logout } from '@/domains/auth/auth-actions'

import {
    LayoutDashboard,
    ShoppingBag,
    GraduationCap,
    Users,
    Package,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    ShieldAlert,
    FolderOpen,
    FileText
} from 'lucide-react'
import { Button } from "@/components/ui/button"

const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    {
        name: 'Produits',
        href: '/admin/products',
        icon: Package,
        subItems: [
            { name: 'Tous les produits', href: '/admin/products' },
            { name: 'Collections', href: '/admin/products/categories' },
            { name: 'Inventaire', href: '/admin/products/inventory' },
        ]
    },
    { name: 'Ventes', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Pricing Pro', href: '/admin/pricing-pro', icon: Settings },
    { name: 'Academy Portal', href: '/admin/academy', icon: GraduationCap },
    { name: 'Vérifications', href: '/admin/verifications', icon: ShieldAlert },
    { name: 'Professionnels', href: '/admin/users', icon: Users },
    { name: 'Analyses', href: '/admin/analytics', icon: BarChart3 },
    {
        name: 'Pages & Contenus',
        href: '/admin/pages',
        icon: FileText,
        subItems: [
            { name: 'Navigation & Header', href: '/admin/navigation' },
            { name: 'Toutes les pages', href: '/admin/pages' },
            { name: 'Page d\'Accueil', href: '/admin/pages/home' },
            { name: 'À Propos', href: '/admin/pages/about' },
            { name: 'Nos Formations', href: '/admin/pages/formations' },
            { name: 'La Boutique', href: '/admin/pages/shop' },
        ]
    },
    {
        name: 'Paramètres',
        href: '/admin/settings',
        icon: Settings,
        subItems: [
            { name: 'Général', href: '/admin/settings' },
            { name: 'Paiements', href: '/admin/settings/payments' },
            { name: 'Facturation', href: '/admin/settings/invoicing' },
            { name: 'Contenu Dashboard', href: '/admin/settings/content/dashboard' },
        ]
    },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const [openSection, setOpenSection] = useState<string | null>(null)

    // Sync open section with current route
    useEffect(() => {
        const activeItem = adminNavItems.find(item =>
            item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href))
        )
        if (activeItem) {
            setOpenSection(activeItem.name)
        }
    }, [pathname])

    const handleToggle = (name: string, hasSubItems: boolean) => {
        if (!hasSubItems) {
            setOpenSection(null)
            return
        }
        setOpenSection(prev => prev === name ? null : name)
    }

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-white text-primary flex flex-col z-50 border-border/40">
            <div className="p-8 h-20 flex items-center border-b border-border/40">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-500">
                        <ShieldAlert size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        Dermakor<span className="text-accent underline decoration-accent/20 underline-offset-4">Admin</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-grow p-6 space-y-1 mt-6 overflow-y-auto">
                {adminNavItems.map((item) => (
                    <div key={item.href} className="space-y-1">
                        {item.subItems ? (
                            <button
                                onClick={() => handleToggle(item.name, true)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 group ${openSection === item.name ? 'text-primary bg-secondary' : 'text-primary/60 hover:text-primary hover:bg-secondary'
                                    }`}
                            >
                                <item.icon size={18} className={`transition-colors ${openSection === item.name ? 'text-accent' : 'text-primary/40 group-hover:text-accent'}`} />
                                <span>{item.name}</span>
                                <ChevronRight
                                    size={14}
                                    className={`ml-auto transition-transform duration-300 ${openSection === item.name ? 'rotate-90 text-accent' : 'text-primary/20'}`}
                                />
                            </button>
                        ) : (
                            <Link
                                href={item.href}
                                onClick={() => handleToggle(item.name, false)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 group ${pathname === item.href ? 'text-primary bg-secondary' : 'text-primary/60 hover:text-primary hover:bg-secondary'
                                    }`}
                            >
                                <item.icon size={18} className={`transition-colors ${pathname === item.href ? 'text-accent' : 'text-primary/40 group-hover:text-accent'}`} />
                                <span>{item.name}</span>
                                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        )}

                        <AnimatePresence initial={false}>
                            {item.subItems && openSection === item.name && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-12 flex flex-col space-y-1 border-l border-slate-100 pl-4 py-1 mt-1">
                                        {item.subItems.map((sub: any) => (
                                            <Link
                                                key={sub.href}
                                                href={sub.href}
                                                className={`py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${pathname === sub.href ? 'text-accent' : 'text-primary/40 hover:text-accent'
                                                    }`}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </nav>

            <div className="p-6 border-t border-border/40 space-y-6">
                <div className="bg-secondary/40 rounded-2xl p-4 flex items-center gap-4 border border-border/20">
                    <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-bold text-xs shadow-md">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Administrateur</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Accès Total</span>
                    </div>
                </div>

                <form action={logout}>
                    <Button
                        variant="ghost"
                        type="submit"
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-[10px] font-bold uppercase tracking-[0.2em] h-12 rounded-xl"
                        size="sm"
                    >
                        <LogOut size={16} className="mr-3" />
                        Quitter l'Admin
                    </Button>
                </form>
            </div>
        </aside>
    )
}
