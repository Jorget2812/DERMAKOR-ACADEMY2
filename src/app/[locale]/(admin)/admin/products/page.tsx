import { getAdminProducts } from "@/domains/admin/product-actions"
import { getCategories } from "@/domains/commerce/actions"
import { ProductsListContainer } from "@/domains/admin/components/ProductsListContainer"

export default async function AdminProductsPage() {
    // Parallel fetch for speed (Opus Standard)
    const [products, categories] = await Promise.all([
        getAdminProducts(),
        getCategories()
    ])

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-serif text-primary">Gestion des Produits</h1>
                <p className="text-muted-foreground mt-1 text-sm font-light uppercase tracking-widest">
                    Éditez les fiches, descriptions et médias de la Boutique Premium.
                </p>
            </header>

            <ProductsListContainer
                initialProducts={products || []}
                categories={categories || []}
            />
        </div>
    )
}
