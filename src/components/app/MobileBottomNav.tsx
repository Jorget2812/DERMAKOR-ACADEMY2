'use client'

import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, GraduationCap, User } from 'lucide-react'

export function MobileBottomNav() {
    const pathname = usePathname()
    const params = useParams()
    const locale = params.locale || 'fr'

    const items = [
        { href: `/${locale}/app`, label: 'Accueil', icon: LayoutDashboard, exact: true },
        { href: `/${locale}/app/products`, label: 'Produits', icon: Package },
        { href: `/${locale}/app/orders`, label: 'Commandes', icon: ShoppingBag },
        { href: `/${locale}/app/academy`, label: 'Academy', icon: GraduationCap },
        { href: `/${locale}/app/profile`, label: 'Profil', icon: User },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex items-center justify-around h-16">
                {items.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-[#C0A76A]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
