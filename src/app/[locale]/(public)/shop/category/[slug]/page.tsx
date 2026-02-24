import { listProductsByCategorySlug, listCategoriesPublic } from '@/domains/commerce/actions'
import { Link } from '@/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ArrowLeft, Package } from 'lucide-react'
import { notFound } from 'next/navigation'

interface Props {
    params: { slug: string; locale: string }
}

export default async function CategoryShopPage({ params }: Props) {
    const [products, categories] = await Promise.all([
        listProductsByCategorySlug(params.slug),
        listCategoriesPublic()
    ])

    const currentCategory = categories.find(c => c.slug === params.slug)
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
                        <h1 className="text-4xl md:text-5xl font-serif text-primary">{currentCategory.name}</h1>
                        <p className="text-muted-foreground font-light">
                            {products.length} produit{products.length > 1 ? 's' : ''} dans cette catégorie
                        </p>
                    </div>
                </div>
            </section>

            {/* Sidebar + Products */}
            <div className="container mx-auto px-6 py-16 flex gap-12">
                {/* Category sidebar */}
                <aside className="hidden lg:block w-56 shrink-0 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Catégories</p>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            href={`/shop/category/${cat.slug}`}
                            className={`flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${cat.slug === params.slug
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                    : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                                }`}
                        >
                            <span>{cat.name}</span>
                            <span className={`text-[10px] font-bold ${cat.slug === params.slug ? 'text-white/70' : 'text-muted-foreground/50'}`}>
                                {cat.product_count}
                            </span>
                        </Link>
                    ))}
                </aside>

                {/* Products Grid */}
                <div className="flex-grow">
                    {products.length === 0 ? (
                        <div className="text-center py-32 space-y-4">
                            <Package size={48} className="mx-auto text-muted-foreground/30" strokeWidth={1} />
                            <p className="text-muted-foreground font-light uppercase tracking-widest text-sm">
                                Aucun produit dans cette catégorie.
                            </p>
                            <Link href="/shop">
                                <Button variant="outline" className="mt-4 rounded-xl">Voir toutes les catégories</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <Card key={product.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-white">
                                    <div className="aspect-square bg-secondary relative overflow-hidden">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                                                <Package size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                                    </div>
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-lg group-hover:text-accent transition-colors">{product.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-2">{product.description}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                                        <div className="w-full flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                            <span>Professionnel</span>
                                            <span className="text-accent underline">Prix masqué</span>
                                        </div>
                                        <Link href={`/shop/${product.slug}`} className="w-full">
                                            <Button className="w-full group-hover:bg-accent transition-colors" variant="secondary">
                                                <Eye className="w-4 h-4 mr-2" /> Voir le produit
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
