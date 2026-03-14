'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ChevronDown } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    product_count: number
}

interface Props {
    categories: Category[]
    currentSlug?: string
}

export function CategoryFilterDropdown({ categories, currentSlug }: Props) {
    const router = useRouter()
    const locale = useLocale()

    return (
        <div className="relative lg:hidden mb-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C0A76A] mb-2 font-oswald">
                Filtrer par catégorie
            </p>
            <div className="relative">
                <select
                    value={currentSlug || ''}
                    onChange={(e) => {
                        if (e.target.value) {
                            router.push(`/${locale}/shop/category/${e.target.value}`)
                        } else {
                            router.push(`/${locale}/shop`)
                        }
                    }}
                    className="w-full appearance-none bg-white border border-[#C0A76A]/30 rounded-2xl px-5 py-3.5 pr-12 text-[12px] font-bold text-primary focus:outline-none focus:border-[#C0A76A] transition-colors cursor-pointer font-oswald uppercase tracking-widest shadow-sm"
                    style={{ background: '#FAFAF8' }}
                >
                    <option value="">Toutes les catégories ({categories.length})</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>
                            {cat.name} — {cat.product_count} produit{cat.product_count > 1 ? 's' : ''}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C0A76A]">
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>
    )
}
