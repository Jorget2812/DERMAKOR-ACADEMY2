'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AddToCartButton } from './AddToCartButton'
import { ShoppingBag, Sparkles } from 'lucide-react'
import { VerifiedProduct } from '../types'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Link } from '@/navigation'

interface ShopClientProps {
    initialProducts: VerifiedProduct[]
}

export function ShopClient({ initialProducts }: ShopClientProps) {
    const searchParams = useSearchParams()
    const categoryId = searchParams.get('category')

    const filteredProducts = categoryId
        ? initialProducts.filter((p: VerifiedProduct) => p.category_id === categoryId)
        : initialProducts

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <Card key={product.variant_id} className="group flex flex-col h-full bg-white border-none shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-3xl overflow-hidden">
                        <Link href={`/app/shop/${product.slug}`} className="cursor-pointer">
                            <CardHeader className="p-0 relative aspect-[4/5] bg-[#F9F7F5] overflow-hidden">
                                {/* Product Image */}
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                                        <ShoppingBag size={64} strokeWidth={1} />
                                    </div>
                                )}

                                {/* Floating Badges */}
                                <div className="absolute inset-x-4 top-4 flex justify-between items-start z-10">
                                    {product.discount_percent > 0 ? (
                                        <div className="bg-accent/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                                            -{product.discount_percent}%
                                        </div>
                                    ) : (
                                        product.badge_text ? (
                                            <div className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                                                <Sparkles size={10} /> {product.badge_text}
                                            </div>
                                        ) : <div />
                                    )}

                                    {product.stock_count === 0 && (
                                        <div className="bg-white/80 backdrop-blur-md text-primary/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/5">
                                            Indisponible
                                        </div>
                                    )}
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </CardHeader>

                            <CardContent className="p-8 flex-grow flex flex-col">
                                <div className="space-y-1 mb-6">
                                    <span className="text-[10px] font-mono text-primary/30 tracking-widest uppercase">
                                        SKU: {product.sku}
                                    </span>
                                    <CardTitle className="text-lg font-serif tracking-tight leading-snug group-hover:text-accent transition-colors duration-300">
                                        {product.name}
                                    </CardTitle>
                                </div>

                                <div className="mt-auto pt-6 border-t border-secondary/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold tracking-tighter text-primary">
                                                    {product.gross_price_cents / 100}
                                                    <span className="text-xs font-medium ml-1 text-primary/40 uppercase tracking-tighter italic">CHF</span>
                                                </span>
                                                {product.discount_percent > 0 && (
                                                    <span className="text-sm text-primary/20 line-through">
                                                        {(product.base_price_cents / 100).toFixed(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-primary/40 uppercase tracking-[0.1em] font-bold mt-1">
                                                HT: {(product.net_price_cents / 100).toFixed(2)} CHF
                                            </span>
                                        </div>

                                        {product.vat_rate > 0 && (
                                            <div className="px-2 py-1 bg-secondary/50 rounded-lg text-[8px] font-bold text-primary/30 uppercase tracking-widest border border-primary/5">
                                                TVA {(Number(product.vat_rate) * 100).toFixed(1)}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Link>

                        <CardFooter className="p-8 pt-0">
                            <AddToCartButton
                                variantId={product.variant_id}
                                name={product.name}
                                sku={product.sku}
                                price={product.gross_price_cents}
                                image={product.images?.[0] || null}
                                disabled={product.stock_count === 0}
                            />
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center bg-white border border-secondary/50 rounded-[40px] shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary/20 mb-6">
                        <ShoppingBag size={32} strokeWidth={1} />
                    </div>
                    <p className="text-primary/40 font-serif italic text-lg tracking-tight">
                        Aucun produit disponible dans cette collection.
                    </p>
                </div>
            )}
        </div>
    )
}
