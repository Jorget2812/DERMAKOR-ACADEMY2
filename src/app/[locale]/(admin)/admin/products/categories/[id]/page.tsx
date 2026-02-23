import { getAdminCategoryDetail } from "@/domains/admin/product-actions"
import { CategoryDetail } from "@/domains/admin/components/CategoryDetail"
import { notFound } from "next/navigation"

export default async function AdminCategoryDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    try {
        const category = await getAdminCategoryDetail(id)
        if (!category) return notFound()

        return (
            <div className="max-w-7xl mx-auto">
                <CategoryDetail category={category} />
            </div>
        )
    } catch (e: any) {
        console.error(e)
        return notFound()
    }
}
