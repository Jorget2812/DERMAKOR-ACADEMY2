import { z } from 'zod'

export const CartItemSchema = z.object({
    variantId: z.string().uuid(),
    qty: z.number().int().positive(),
    name: z.string(),
    sku: z.string(),
    price: z.number(),
    image: z.string().nullable(),
})

export type CartItem = z.infer<typeof CartItemSchema>

export interface PublicProduct {
    id: string
    slug: string
    name: string
    description: string | null
    category_id: string | null
    images?: string[]
    created_at?: string
    rating?: number
    rating_count?: number
    is_bestseller?: boolean
    badge_text?: string | null
    badge_color?: string | null
    badge_secondary_text?: string | null
    show_rating?: boolean
}

export interface VerifiedProduct {
    product_id: string
    variant_id: string
    name: string
    sku: string
    base_price_cents: number
    compare_at_price_cents?: number | null
    resale_factor: number
    discount_percent: number
    net_price_cents: number
    vat_rate: number
    vat_amount_cents: number
    gross_price_cents: number
    stock_count: number
    category_id: string | null;
    images: string[] | null;
    slug: string;
    description: string | null;
    badge_text: string | null;
    badge_color?: string | null;
    badge_secondary_text?: string | null;
    show_rating?: boolean;
    rating?: number;
    rating_count?: number;
    is_bestseller?: boolean;
}


export interface OrderInput {
    shippingAddress: {
        fullName: string
        street: string
        city: string
        postalCode: string
        country: 'CH'
        phone: string
    }
    paymentMethod?: 'STRIPE' | 'BANK_TRANSFER'
}
