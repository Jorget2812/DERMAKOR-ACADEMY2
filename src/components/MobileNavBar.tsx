'use client'

import React, { useEffect, useState } from 'react'
import { Link, usePathname } from '@/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, ShoppingBag, GraduationCap, User, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
    { label: 'Accueil', icon: Home, href: '/' },
    { label: 'Boutique', icon: ShoppingBag, href: '/shop' },
    { label: 'Pro', icon: Sparkles, href: '/pro' },
    { label: 'Academy', icon: GraduationCap, href: '/academy-info' },
    { label: 'Compte', icon: User, href: '/login' }, // We'll handle /app logic in href or a wrapper
]

export function MobileNavBar() {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)

    // Initial animation delay
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500)
        return () => clearTimeout(timer)
    }, [])

    // Do not show on admin or app routes (already filtered at layout level usually, but double safety)
    if (pathname.includes('/admin') || pathname.includes('/app')) {
        return null
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ translateY: '100%' }}
                    animate={{ translateY: 0 }}
                    exit={{ translateY: '100%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 right-0 z-[50] md:hidden"
                >
                    {/* Glass Container */}
                    <div className="relative bg-white/85 backdrop-blur-[20px] saturate-[180%] border-t border-[#C0A76A]/20 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] px-6 pb-[env(safe-area-inset-bottom)] h-[calc(72px+env(safe-area-inset-bottom))]">
                        <div className="flex items-center justify-between h-full max-w-md mx-auto">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                                return (
                                    <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center min-w-[48px] h-[48px] pt-1">
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            className="flex flex-col items-center gap-1 transition-colors duration-200"
                                        >
                                            <item.icon
                                                size={22}
                                                strokeWidth={1.5}
                                                className={isActive ? 'text-[#C0A76A]' : 'text-[#8A8578]'}
                                            />
                                            <span className={`font-oswald text-[10px] uppercase tracking-[0.5px] font-semibold ${isActive ? 'text-[#C0A76A]' : 'text-[#8A8578]'}`}>
                                                {item.label}
                                            </span>
                                        </motion.div>

                                        {/* Active Indicator (optional, but premium feel) */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className="absolute -top-1 w-1 h-1 bg-[#C0A76A] rounded-full"
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
