'use server'

import { createClient } from '@/lib/supabase/server'
import { PublicProduct, VerifiedProduct, CartItem, OrderInput } from './types'
import { Json } from '@/lib/supabase/types'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Public: List products without prices
 */
export async function listProductsPublic(): Promise<PublicProduct[]> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('list_products_public')
    if (error) {
        console.error("RPC Error:", error)
        return []
    }
    return data || []
}

/**
 * Verified: List products with tiered pricing and VAT
 */
export async function listProductsForVerified(): Promise<VerifiedProduct[]> {
    const supabase = await createClient()

    // 1. Get user profile for level/locale
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('level, locale')
        .eq('id', user.id)
        .single()

    const level = profile?.level || 'NONE'
    const locale = profile?.locale || 'fr'

    // 2. Fetch products with pricing
    const { data: products, error } = await supabase.rpc('get_products_with_pricing')
    if (error) {
        console.error("RPC Error:", error)
        return []
    }

    // 3. Fetch all active badges for this level/locale
    const { data: badges } = await supabase
        .from('product_badges')
        .select('product_id, badge_text')
        .eq('level', level)
        .eq('locale', locale)
        .eq('enabled', true)

    // 4. Map badges to products
    const typedProducts = (products as VerifiedProduct[]).map(p => ({
        ...p,
        badge_text: badges?.find(b => b.product_id === p.product_id)?.badge_text || null
    }))

    // 5. Fallback logic: if badge missing for current locale, try 'fr'
    if (locale !== 'fr') {
        const { data: fallbackBadges } = await supabase
            .from('product_badges')
            .select('product_id, badge_text')
            .eq('level', level)
            .eq('locale', 'fr')
            .eq('enabled', true)

        return typedProducts.map(p => {
            if (p.badge_text) return p
            return {
                ...p,
                badge_text: fallbackBadges?.find(b => b.product_id === p.product_id)?.badge_text || null
            }
        })
    }

    return typedProducts
}

/**
 * Get single product by slug (Public Information)
 * Normalization: Returns a single PublicProduct or null.
 * Tiered access: All users (public, standard, premium) see catalog info.
 */
export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
    const supabase = await createClient()

    // Fetch from public products table (name, description, images are public)
    const { data: product, error } = await supabase
        .from('products')
        .select('id, name, slug, description, images, category_id, created_at')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle()

    if (error || !product) {
        return null
    }

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: product.category_id,
        images: Array.isArray(product.images) ? product.images : [],
        created_at: product.created_at || undefined
    }
}

/**
 * Get pricing and stock details (Protected Information)
 * Only accessible if session is APPROVED + ACTIVE
 * Uses RPC to bypass RLS and ensure consistency with catalog.
 */
export async function getPricingBySlug(slug: string): Promise<VerifiedProduct | null> {
    const supabase = await createClient()

    // 1. Get user profile and verify authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Fetch price details using the security-hardened RPC
    // We use the same RPC as listProductsForVerified for consistency
    const { data: pricingData, error } = await supabase.rpc('get_products_with_pricing')

    if (error || !pricingData || !Array.isArray(pricingData)) {
        return null
    }

    // 3. Filter for the specific product slug
    const productDetail = (pricingData as VerifiedProduct[]).find(p => p.slug === slug)

    if (!productDetail) {
        return null
    }

    return productDetail
}

/**
 * Get all categories
 */
export async function getCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    if (error) {
        console.error("Error fetching categories:", error)
        return []
    }
    return data || []
}

/**
 * Verified: Create Stripe Checkout Session
 * Validates stock and calculates final pricing on server
 */
export async function createCheckoutSession(items: CartItem[], orderInfo: OrderInput) {
    const supabase = await createClient()

    // 1. Get user and verify status
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const { data: profile } = await supabase
        .from('profiles')
        .select('verification_status, status, level')
        .eq('id', user.id)
        .single()

    if (!profile || profile.verification_status !== 'APPROVED' || profile.status !== 'ACTIVE') {
        throw new Error("Compte non vérifié o inactif")
    }

    // 2. Resolve pricing and stock for these items
    const { data: pricingData, error: pricingError } = await supabase.rpc('get_products_with_pricing')
    if (pricingError || !pricingData) throw new Error("Erreur de calcul des prix")


    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    for (const item of items) {
        const product = (pricingData as VerifiedProduct[]).find((p) => p.variant_id === item.variantId)
        if (!product) throw new Error(`Produit introuvable: ${item.variantId}`)
        if (product.stock_count < item.qty) throw new Error(`Stock insuffisant pour: ${product.name}`)


        lineItems.push({
            price_data: {
                currency: 'CHF',
                product_data: {
                    name: product.name,
                    metadata: { variantId: item.variantId, sku: product.sku },
                },
                unit_amount: product.gross_price_cents, // Important: Includes VAT if level=NONE
            },
            quantity: item.qty,
        })
    }

    // 3. Create Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/orders/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/shop`,
        metadata: {
            userId: user.id,
            shippingAddress: JSON.stringify(orderInfo.shippingAddress)
        }
    })

    return { url: session.url }
}

/**
 * Create a Bank Transfer Order using the secure RPC
 */
export async function createBankTransferOrder(items: CartItem[], orderInfo: OrderInput) {
    const supabase = await createClient()

    // 1. Get user and verify status
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // 2. Call the secure RPC to create the order
    // This handles stock decrement, pricing validation, VAT, and totals calculation
    const shippingAddress = { ...orderInfo.shippingAddress, country: 'CH' }

    const { data: orderId, error: rpcError } = await (supabase as any).rpc('create_order_secure', {
        p_shipping_address: shippingAddress as any,
        p_billing_address: shippingAddress as any, // Default billing to shipping
        p_items: items.map(i => ({ variant_id: i.variantId, qty: i.qty }))
    })

    if (rpcError) {
        // OPUS: Structured logging for critical failure
        console.error("[createBankTransferOrder] RPC FATAL:", {
            code: rpcError.code,
            message: rpcError.message,
            details: rpcError.details,
            hint: rpcError.hint,
            userId: user.id
        })

        // Return the actual SQL error message to the UI for debugging
        throw new Error(`[DB_ERROR] ${rpcError.message || "Erreur inconnue"}`)
    }

    // 3. Fetch the order reference (invoice_number) for the confirmation message
    const { data: order } = await supabase
        .from('orders')
        .select('invoice_number')
        .eq('id', orderId as string)
        .single()

    return {
        success: true,
        reference: order?.invoice_number || `DK-${(orderId as string).substring(0, 8).toUpperCase()}`,
        id: orderId as string
    }
}

export async function getUserStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { orderCount: 0, completedLessons: 0 }

    const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'COMPLETED')

    return {
        orderCount: orderCount || 0,
        completedLessons: completedLessons || 0
    }
}
