'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Edit2, ShoppingBag, ExternalLink, Package, FolderOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Link } from '@/navigation'

interface ProductsListContainerProps {
    initialProducts: any[]
    categories: any[]
}

export function ProductsListContainer({ initialProducts, categories }: ProductsListContainerProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredProducts = initialProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Rechercher un produit ou slug..."
                    className="pl-10 h-10 rounded-xl bg-white border-secondary/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white">
                        <CardHeader className="p-0 aspect-video relative bg-secondary/20 overflow-hidden">
                            {product.images?.[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                                    <ShoppingBag size={48} strokeWidth={1} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <Link href={`/admin/products/${product.id}`}>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" /> Éditer
                                    </Button>
                                </Link>
                                <Link href={`/app/shop/${product.slug}`} target="_blank">
                                    <Button size="icon" variant="secondary" className="rounded-full">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-primary/30 tracking-widest uppercase">
                                    {product.slug}
                                </span>
                                <CardTitle className="text-lg font-serif">{product.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    {product.category_id && (
                                        <Link href={`/admin/products/categories/${product.category_id}`}>
                                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest border-accent/20 text-accent hover:bg-accent/5 transition-colors">
                                                {product.categories?.name || 'Collection'}
                                            </Badge>
                                        </Link>
                                    )}
                                    <Badge variant="outline" className="text-[9px] uppercase font-mono text-slate-400 border-slate-100">
                                        {product.product_variants?.reduce((s: number, v: any) => s + (v.stock_count || 0), 0)} Stock
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-3 font-light">
                                    {product.description || "Pas de description"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
