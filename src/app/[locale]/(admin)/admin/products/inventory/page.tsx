import { getAdminProducts } from "@/domains/admin/product-actions"
import { getCategories } from "@/domains/commerce/actions"
import { InventoryContainer } from "@/domains/admin/components/InventoryContainer"
import { Package } from 'lucide-react'

export default async function AdminInventoryPage() {
    const [products, categories] = await Promise.all([
        getAdminProducts(),
        getCategories()
    ])

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Package className="text-accent w-6 h-6" />
                        <h1 className="text-3xl font-serif text-primary">Inventaire</h1>
                    </div>
                    <p className="text-muted-foreground text-sm font-light uppercase tracking-widest">
                        Gestion des stocks, prix retail et catégories par variante.
                    </p>
                </div>
            </header>

            <InventoryContainer
                initialProducts={products || []}
                categories={categories || []}
            />
        </div>
    )
}
