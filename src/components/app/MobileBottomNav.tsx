'use client'

import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, GraduationCap, ShoppingBag } from 'lucide-react'
import { useCart } from '@/domains/commerce/store'

export function MobileBottomNav() {
    const pathname = usePathname()
    const params = useParams()
    const locale = params.locale || 'fr'

    const cartItems = useCart(state => state.items)
    const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0)

    const items = [
        { href: `/${locale}/app`, label: 'Accueil', icon: LayoutDashboard, exact: true },
        { href: `/${locale}/app/shop`, label: 'Produits', icon: Package },
        { href: `/${locale}/app/checkout`, label: 'Panier', icon: ShoppingCart, badge: cartCount },
        { href: `/${locale}/app/academy`, label: 'Academy', icon: GraduationCap },
        { href: `/${locale}/app/orders`, label: 'Commandes', icon: ShoppingBag },
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
                            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive ? 'text-[#C0A76A]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <div className="relative">
                                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#C0A76A] text-white text-[9px] font-bold px-0.5">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
