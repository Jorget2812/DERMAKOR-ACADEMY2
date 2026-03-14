import { listCategoriesPublic } from '@/domains/commerce/actions'
import { Link } from '@/navigation'
import { ArrowRight, Package2, Layers } from 'lucide-react'

export default async function PublicShopPage() {
    const categories = await listCategoriesPublic()

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            {/* Hero Header */}
            <section className="border-b bg-white py-10 md:py-16">
                <div className="container mx-auto px-5 md:px-6 text-center space-y-4 md:space-y-6">
                    <span className="inline-block px-6 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] uppercase tracking-[0.3em] font-bold">
                        Collections Exclusives
                    </span>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-serif text-primary">Notre Boutique</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed text-sm sm:text-base lg:text-lg">
                        Sélectionnez une catégorie pour découvrir notre gamme exclusive de produits dermo-esthétiques haute performance.
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container mx-auto px-5 md:px-6 py-10 md:py-20">
                {categories.length === 0 ? (
                    <div className="text-center py-32 space-y-4">
                        <Layers size={48} className="mx-auto text-muted-foreground/30" />
                        <p className="text-muted-foreground font-light uppercase tracking-widest text-sm">
                            Aucune catégorie disponible.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-serif italic text-primary">
                                {categories.length} catégorie{categories.length > 1 ? 's' : ''} disponible{categories.length > 1 ? 's' : ''}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {categories.map((cat, i) => (
                                <Link
                                    key={cat.id}
                                    href={`/shop/category/${cat.slug}`}
                                    className="group block"
                                >
                                    <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 group-hover:border-accent/30 group-hover:shadow-2xl group-hover:shadow-accent/10 transition-all duration-500">
                                        {/* Background pattern */}
                                        <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity" style={{
                                            backgroundImage: `radial-gradient(circle at ${(i % 3) * 33 + 15}% ${(i % 2) * 50 + 25}%, #C5A05920 0%, transparent 60%)`
                                        }} />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col justify-between p-8">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                                <Package2 size={22} />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {cat.product_count} produit{cat.product_count > 1 ? 's' : ''}
                                                </div>
                                                <h3 className="text-xl font-serif text-primary group-hover:text-accent transition-colors duration-300">
                                                    {cat.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                    Voir les produits <ArrowRight size={12} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow badge */}
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-muted-foreground/40 group-hover:text-accent group-hover:shadow-accent/20 transition-all duration-300">
                                            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}
