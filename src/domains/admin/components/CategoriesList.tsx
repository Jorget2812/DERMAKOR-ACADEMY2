'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FolderOpen, ChevronRight, Package } from 'lucide-react'
import { Link } from '@/navigation'

interface CategoryWithCount {
    id: string
    name: string
    slug: string
    product_count: number
}

interface CategoriesListProps {
    categories: CategoryWithCount[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
    const [search, setSearch] = useState('')

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher una collection..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-slate-200 bg-white"
                    />
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="pl-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Collection</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Produits</th>
                                <th className="pr-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((category) => (
                                <tr
                                    key={category.id}
                                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                >
                                    <td className="pl-6 py-5">
                                        <Link href={`/admin/products/categories/${category.id}`} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                                <FolderOpen size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-serif text-base text-slate-900">{category.name}</span>
                                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter">/{category.slug}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg px-2 text-[10px] font-bold uppercase tracking-tight">
                                            {category.product_count} <Package size={10} className="ml-1 inline opacity-40" />
                                        </Badge>
                                    </td>
                                    <td className="pr-6 py-5 text-right">
                                        <ChevronRight size={16} className="text-slate-200 group-hover:text-accent group-hover:translate-x-1 transition-all inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-24 text-center">
                        <FolderOpen size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 text-sm font-light uppercase tracking-widest">Aucune collection trouvée.</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
