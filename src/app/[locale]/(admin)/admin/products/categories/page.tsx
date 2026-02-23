import { getAdminCategoriesWithCount } from "@/domains/admin/product-actions"
import { CategoriesList } from "@/domains/admin/components/CategoriesList"
import { FolderOpen } from 'lucide-react'

export default async function AdminCategoriesPage() {
    const categories = await getAdminCategoriesWithCount()

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <FolderOpen className="text-accent w-6 h-6" />
                        <h1 className="text-3xl font-serif text-primary">Collections</h1>
                    </div>
                    <p className="text-muted-foreground text-sm font-light uppercase tracking-widest">
                        Gérez vos catégories de produits et organisez votre catalogue.
                    </p>
                </div>
            </header>

            <CategoriesList categories={categories} />
        </div>
    )
}
