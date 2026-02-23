import { createClient } from '@/lib/supabase/server'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { InventoryContainer } from '@/domains/admin/components/InventoryContainer'

export default async function AdminInventoryPage() {
    const supabase = await createClient()

    // Fetch products with their variants
    const { data: products, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (name),
      product_variants (*)
    `)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // Fetch categories
    const { data: categories } = await supabase.from('categories').select('*').order('name')

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-serif text-primary">Gestion des Stocks</h1>
                <p className="text-muted-foreground mt-1 text-sm font-light uppercase tracking-widest">Contrôlez vos produits, variantes et niveaux de stock SKUs.</p>
            </header>

            <InventoryContainer initialProducts={products || []} categories={categories || []} />
        </div>
    )
}
