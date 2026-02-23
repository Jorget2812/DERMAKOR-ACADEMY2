'use client'

import { Link, usePathname } from '@/navigation'
import { logout } from '@/domains/auth/auth-actions'
import { useState, useEffect } from 'react'
import { getCategories } from '@/domains/commerce/actions'

import { CartButton } from '@/domains/commerce/components/CartButton'
import {
    LayoutDashboard,
    ShoppingBag,
    GraduationCap,
    LogOut,
    ChevronRight,
    ShieldCheck,
    ChevronDown,
    FolderOpen
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'

export default function Sidebar() {
    const pathname = usePathname()
    const [isBoutiqueOpen, setIsBoutiqueOpen] = useState(pathname.includes('/shop'))
    const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])

    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 border-r bg-white text-primary flex flex-col z-50 border-border/40">
            <div className="p-8 h-20 flex items-center justify-between border-b border-border/40">
                <Link href="/app" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-500">
                        <GraduationCap size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        Dermakor<span className="text-accent underline decoration-accent/20 underline-offset-4">Pro</span>
                    </span>
                </Link>
                <CartButton />
            </div>

            <nav className="flex-grow p-6 space-y-1.5 mt-6 overflow-y-auto no-scrollbar">
                {/* Dashboard */}
                <Link
                    href="/app"
                    className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 group",
                        pathname === '/app' ? "bg-accent/5 text-accent" : "text-primary/60 hover:text-primary hover:bg-secondary"
                    )}
                >
                    <LayoutDashboard size={18} className={cn("transition-colors", pathname === '/app' ? "text-accent" : "text-primary/40 group-hover:text-accent")} />
                    <span>Tableau de bord</span>
                </Link>

                {/* Boutique Pro (Collapsible) */}
                <div className="space-y-1">
                    <button
                        onClick={() => setIsBoutiqueOpen(!isBoutiqueOpen)}
                        className={cn(
                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 group",
                            pathname.includes('/shop') ? "text-primary" : "text-primary/60 hover:text-primary hover:bg-secondary"
                        )}
                    >
                        <ShoppingBag size={18} className={cn("transition-colors", pathname.includes('/shop') ? "text-accent" : "text-primary/40 group-hover:text-accent")} />
                        <span>Boutique Pro</span>
                        <ChevronDown size={14} className={cn("ml-auto transition-transform duration-300", isBoutiqueOpen ? "rotate-180" : "")} />
                    </button>

                    {isBoutiqueOpen && (
                        <div className="pl-12 pr-4 py-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Link
                                href="/app/shop"
                                className={cn(
                                    "flex items-center gap-2 py-2 text-[10px] font-medium uppercase tracking-widest transition-colors",
                                    pathname === '/app/shop' ? "text-accent" : "text-primary/50 hover:text-primary"
                                )}
                            >
                                <span className={cn("w-1 h-1 rounded-full", pathname === '/app/shop' ? "bg-accent" : "bg-primary/20")} />
                                Tous les produits
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/app/shop?category=${cat.id}`}
                                    className={cn(
                                        "flex items-center gap-2 py-2 text-[10px] font-medium uppercase tracking-widest transition-colors",
                                        pathname === `/app/shop` && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('category') === cat.id ? "text-accent" : "text-primary/50 hover:text-primary"
                                    )}
                                >
                                    <span className={cn("w-1 h-1 rounded-full", (pathname === `/app/shop` && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('category') === cat.id) ? "bg-accent" : "bg-primary/20")} />
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Academy */}
                <Link
                    href="/app/academy"
                    className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 group",
                        pathname.includes('/app/academy') ? "bg-accent/5 text-accent" : "text-primary/60 hover:text-primary hover:bg-secondary"
                    )}
                >
                    <GraduationCap size={18} className={cn("transition-colors", pathname.includes('/app/academy') ? "text-accent" : "text-primary/40 group-hover:text-accent")} />
                    <span>Académie</span>
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </nav>

            <div className="p-6 border-t border-border/40 space-y-6">
                <div className="bg-secondary/40 rounded-2xl p-4 flex items-center gap-4 border border-border/20">
                    <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-bold text-xs shadow-md">
                        P
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Profil Pro</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            <ShieldCheck size={10} className="text-accent" /> Vérifié
                        </span>
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
                        Déconnexion
                    </Button>
                </form>
            </div>
        </aside>
    )
}
