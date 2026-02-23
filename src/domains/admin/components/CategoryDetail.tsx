'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ChevronLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from '@/navigation'

interface CategoryDetailProps {
    category: any
}

export function CategoryDetail({ category }: CategoryDetailProps) {
    const products = category.products || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products/categories"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent/20 transition-all hover:scale-105"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif text-primary truncate max-w-xl">{category.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest border-slate-200">
                            {products.length} Produits
                        </Badge>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400 font-mono italic">/{category.slug}</span>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="pl-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Produit</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">SKUs</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Stock Total</th>
                                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Prix Retail</th>
                                <th className="pr-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.map((product: any) => {
                                const variants = product.product_variants || []
                                const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock_count || 0), 0)
                                const basePrice = variants[0]?.base_price_cents || 0
                                const skuCount = variants.length

                                return (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded border border-slate-100 bg-white flex-shrink-0 overflow-hidden shadow-sm">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                            <Package size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 line-clamp-1">{product.name}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">{product.vendor || 'Dermakor'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant="outline" className="border-slate-100 text-[10px] font-mono">
                                                {skuCount}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`text-xs font-bold ${totalStock < 20 ? 'text-amber-600' : 'text-slate-600'}`}>
                                                {totalStock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="font-serif text-slate-900">
                                                CHF {(basePrice / 100).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="pr-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-accent hover:bg-accent/5 rounded-lg h-8"
                                            >
                                                <Link href={`/admin/products/${product.id}`}>
                                                    Gérer <ArrowRight size={12} className="ml-2" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="py-24 text-center">
                        <Package size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 text-sm font-light uppercase tracking-widest">Cette collection est vide.</p>
                        <Button variant="link" asChild className="mt-4 text-accent text-xs font-bold uppercase tracking-widest">
                            <Link href="/admin/products">Ajouter des produits</Link>
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}
