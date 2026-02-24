'use client'

import { useState, useRef, useEffect } from 'react'
import { Link } from '@/navigation'
import { ChevronDown, Package2, ArrowRight } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    product_count: number
}

interface ShopDropdownProps {
    label: string
    categories: Category[]
}

export function ShopDropdown({ label, categories }: ShopDropdownProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70 hover:text-accent transition-all duration-300 group"
            >
                {label}
                <ChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${open ? 'rotate-180 text-accent' : ''}`}
                />
            </button>

            {/* Dropdown Panel */}
            <div
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 z-50 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
            >
                <div className="bg-white rounded-2xl shadow-2xl shadow-primary/10 border border-slate-100 p-4 min-w-[240px]">
                    {/* Arrow indicator */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />

                    {/* Header */}
                    <div className="px-2 pb-3 mb-2 border-b border-slate-50">
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Collections</p>
                    </div>

                    {/* Category list */}
                    <div className="space-y-0.5">
                        {categories.length === 0 ? (
                            <p className="px-3 py-3 text-xs text-muted-foreground italic">Aucune catégorie disponible.</p>
                        ) : (
                            categories.map(cat => (
                                <Link
                                    key={cat.id}
                                    href={`/shop/category/${cat.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-accent/5 hover:text-accent group/item transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground/50 group-hover/item:bg-accent/10 group-hover/item:text-accent transition-colors">
                                            <Package2 size={14} />
                                        </div>
                                        <span className="text-[11px] font-semibold text-primary group-hover/item:text-accent transition-colors">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-muted-foreground/50">{cat.product_count}</span>
                                        <ArrowRight size={10} className="text-muted-foreground/30 group-hover/item:text-accent group-hover/item:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer: See all */}
                    <div className="mt-3 pt-3 border-t border-slate-50">
                        <Link
                            href="/shop"
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
                        >
                            Voir toutes les catégories <ArrowRight size={10} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
