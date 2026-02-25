import { listProductsByCategorySlug, listCategoriesPublic } from '@/domains/commerce/actions'
import { Link } from '@/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ArrowLeft, Package, Star, Lock, ShoppingBag } from 'lucide-react'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { StarRating } from '@/components/ui/star-rating'

interface Props {
    params: { slug: string; locale: string }
}

export default async function CategoryShopPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params
    const [products, categories] = await Promise.all([
        listProductsByCategorySlug(slug),
        listCategoriesPublic()
    ])

    const currentCategory = categories.find(c => c.slug === slug)
    if (!currentCategory) notFound()

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            {/* Breadcrumb + Header */}
            <section className="border-b bg-white py-12">
                <div className="container mx-auto px-6 space-y-6">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">
                        <ArrowLeft size={12} /> Toutes les catégories
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">{currentCategory.name}</h1>
                        <p className="text-muted-foreground font-light text-sm tracking-wide">
                            {products.length} produit{products.length > 1 ? 's' : ''} d'exception dans cette collection
                        </p>
                    </div>
                </div>
            </section>

            {/* Sidebar + Products */}
            <div className="container mx-auto px-6 py-16 flex flex-col lg:flex-row gap-16">
                {/* Category sidebar */}
                <aside className="hidden lg:block w-64 shrink-0 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30 mb-6">Collections</p>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/shop/category/${cat.slug}`}
                                className={cn(
                                    "flex items-center justify-between py-3.5 px-6 rounded-[20px] text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                                    cat.slug === slug
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                        : "text-primary/40 hover:text-primary hover:bg-secondary/50"
                                )}
                            >
                                <span>{cat.name}</span>
                                <span className={cn(
                                    "text-[9px] font-mono",
                                    cat.slug === slug ? "text-white/40" : "text-primary/20"
                                )}>
                                    {cat.product_count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Products Grid */}
                <div className="flex-grow">
                    {products.length === 0 ? (
                        <div className="text-center py-40 bg-white rounded-[40px] border border-secondary shadow-sm">
                            <ShoppingBag size={48} className="mx-auto text-primary/10 mb-6" strokeWidth={1} />
                            <p className="text-primary/40 font-serif italic text-lg tracking-tight">
                                Aucun produit disponible actuellement.
                            </p>
                            <Link href="/shop" className="inline-block mt-8">
                                <Button variant="outline" className="rounded-full px-8 py-6 uppercase text-[10px] font-bold tracking-widest hover:bg-primary hover:text-white transition-all">
                                    Découvrir les autres collections
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                            {products.map((product) => (
                                <Card key={product.id} className="group flex flex-col h-full bg-white border-none shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-3xl overflow-hidden">
                                    <Link href={`/shop/${product.slug}`} className="cursor-pointer">
                                        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#F5F5F0]">
                                            {/* Product Image */}
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                                                    <ShoppingBag size={64} strokeWidth={1} />
                                                </div>
                                            )}

                                            {/* Floating Badges */}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                                {product.badge_text && (
                                                    <div
                                                        className="backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase font-oswald tracking-widest"
                                                        style={{ backgroundColor: product.badge_color || '#C0A76A' }}
                                                    >
                                                        {product.badge_text}
                                                    </div>
                                                )}
                                                {product.badge_secondary_text && (
                                                    <div className="bg-black/80 backdrop-blur-md text-white text-[8px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase font-oswald tracking-[0.15em]">
                                                        {product.badge_secondary_text}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>

                                        <CardContent className="p-6 flex-grow flex flex-col">
                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[9px] font-bold text-primary/20 uppercase tracking-[0.2em]">DermaKor Swiss</span>
                                                    {product.is_bestseller && (
                                                        <span className="text-[10px] font-bold text-[#C0A76A] uppercase tracking-[0.1em] font-oswald border border-[#C0A76A] px-2 py-0.5 rounded-[2px] bg-transparent">
                                                            Bestseller
                                                        </span>
                                                    )}
                                                </div>
                                                <CardTitle className="text-xl font-serif tracking-tight leading-snug group-hover:text-accent transition-colors duration-300">
                                                    {product.name}
                                                </CardTitle>

                                                {/* Ratings Display */}
                                                {product.show_rating && (
                                                    <div className="mt-2">
                                                        <StarRating
                                                            rating={product.rating || 0}
                                                            count={product.rating_count}
                                                            size="sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-secondary/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.15em] mb-1">Tarification</span>
                                                        <span className="text-sm font-bold text-accent tracking-widest uppercase">Prix masqué</span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary/20">
                                                        <Lock size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Link>

                                    <CardFooter className="p-8 pt-0">
                                        <Link href={`/shop/${product.slug}`} className="w-full">
                                            <Button className="w-full h-12 rounded-2xl bg-primary text-white hover:bg-accent transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/5 group" variant="default">
                                                Détails du produit
                                                <Eye size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
