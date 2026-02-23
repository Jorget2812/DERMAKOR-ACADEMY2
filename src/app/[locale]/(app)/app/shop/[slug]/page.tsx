import { getProductBySlug, getPricingBySlug } from "@/domains/commerce/actions"
import { ProductDetailClient } from "@/domains/commerce/components/ProductDetailClient"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch metadata in parallel
    const [product, pricing, { data: isAdmin }, { data: profile }] = await Promise.all([
        getProductBySlug(slug),
        getPricingBySlug(slug),
        supabase.rpc('is_admin'),
        user ? supabase.from('profiles').select('level').eq('id', user.id).single() : Promise.resolve({ data: null })
    ])

    if (!product) {
        notFound()
    }

    // 2. Fetch active badge for this product/level/locale
    const userLevel = profile?.level || 'NONE'
    const { data: badgeData } = await supabase
        .from('product_badges')
        .select('badge_text')
        .eq('product_id', product.id)
        .eq('level', userLevel)
        .eq('locale', locale)
        .eq('enabled', true)
        .maybeSingle()

    let badgeText = badgeData?.badge_text || null

    // 3. Fallback to 'fr' if current locale has no badge
    if (!badgeText && locale !== 'fr') {
        const { data: fallbackBadge } = await supabase
            .from('product_badges')
            .select('badge_text')
            .eq('product_id', product.id)
            .eq('level', userLevel)
            .eq('locale', 'fr')
            .eq('enabled', true)
            .maybeSingle()
        badgeText = fallbackBadge?.badge_text || null
    }

    return (
        <ProductDetailClient
            product={product}
            initialPricing={pricing}
            isAdmin={!!isAdmin}
            badgeText={badgeText}
        />
    )
}
