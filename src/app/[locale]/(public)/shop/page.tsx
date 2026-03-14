import { listCategoriesPublic } from '@/domains/commerce/actions'
import { Link } from '@/navigation'
import { ArrowRight, Package2, Layers } from 'lucide-react'
import { CategoryFilterDropdown } from '@/components/shop/CategoryFilterDropdown'

export default async function PublicShopPage() {
    const categories = await listCategoriesPublic()

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            {/* Hero Header */}
            <section className="border-b bg-white py-8 md:py-16">
                <div className="container mx-auto px-5 md:px-6 text-center space-y-3 md:space-y-6">
                    <span className="inline-block px-5 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] uppercase tracking-[0.3em] font-bold">
                        Collections Exclusives
                    </span>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-serif text-primary">Notre Boutique</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed text-sm sm:text-base lg:text-lg hidden sm:block">
                        Sélectionnez une catégorie pour découvrir notre gamme exclusive de produits dermo-esthétiques haute performance.
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container mx-auto px-4 sm:px-5 md:px-6 py-8 md:py-20">
                {categories.length === 0 ? (
                    <div className="text-center py-32 space-y-4">
                        <Layers size={48} className="mx-auto text-muted-foreground/30" />
                        <p className="text-muted-foreground font-light uppercase tracking-widest text-sm">
                            Aucune catégorie disponible.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-5 md:mb-10">
                            <h2 className="text-lg sm:text-2xl font-serif italic text-primary">
                                {categories.length} catégorie{categories.length > 1 ? 's' : ''} disponible{categories.length > 1 ? 's' : ''}
                            </h2>
                        </div>

                        {/* Dropdown filtro — solo visible en mobile/tablet */}
                        <CategoryFilterDropdown categories={categories} />

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
                            {categories.map((cat, i) => (
                                <Link
                                    key={cat.id}
                                    href={`/shop/category/${cat.slug}`}
                                    className="group block"
                                >
                                    <div className="relative h-28 sm:h-44 md:h-56 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 group-hover:border-accent/30 group-hover:shadow-2xl group-hover:shadow-accent/10 transition-all duration-500">
                                        {/* Background pattern */}
                                        <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity" style={{
                                            backgroundImage: `radial-gradient(circle at ${(i % 3) * 33 + 15}% ${(i % 2) * 50 + 25}%, #C5A05920 0%, transparent 60%)`
                                        }} />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-6 md:p-8">
                                            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white shadow-md flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                                <Package2 size={13} className="sm:hidden" />
                                                <Package2 size={18} className="hidden sm:block" />
                                            </div>
                                            <div className="space-y-0.5 sm:space-y-2">
                                                <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    {cat.product_count} produit{cat.product_count > 1 ? 's' : ''}
                                                </div>
                                                <h3 className="text-xs sm:text-lg font-serif text-primary group-hover:text-accent transition-colors duration-300 leading-tight line-clamp-2">
                                                    {cat.name}
                                                </h3>
                                                <div className="hidden sm:flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                    Voir les produits <ArrowRight size={12} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow badge — hidden on very small cards */}
                                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-muted-foreground/40 group-hover:text-accent group-hover:shadow-accent/20 transition-all duration-300">
                                            <ArrowRight size={12} className="sm:hidden group-hover:translate-x-0.5 transition-transform" />
                                            <ArrowRight size={18} className="hidden sm:block group-hover:translate-x-0.5 transition-transform" />
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
