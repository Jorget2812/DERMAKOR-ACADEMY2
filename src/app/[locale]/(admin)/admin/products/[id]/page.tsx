import { getAdminProducts } from "@/domains/admin/product-actions"
import { createClient } from "@/lib/supabase/server"
import { ProductEditForm } from "@/domains/admin/components/ProductEditForm"
import { notFound } from "next/navigation"

interface EditProductPageProps {
    params: {
        id: string
        locale: string
    } | Promise<{ id: string, locale: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const resolvedParams = params instanceof Promise ? await params : params
    const { id } = resolvedParams

    const supabase = await createClient()

    // Fetch product with variants
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            product_variants(*)
        `)
        .eq('id', id)
        .single()

    if (error || !product) {
        notFound()
    }

    // Fetch categories for the select input
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    return (
        <div className="min-h-screen bg-[#F6F6F6]">
            <ProductEditForm
                product={product}
                categories={categories || []}
            />
        </div>
    )
}
