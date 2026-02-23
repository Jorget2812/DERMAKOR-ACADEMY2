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
}

export interface VerifiedProduct {
    product_id: string
    variant_id: string
    name: string
    sku: string
    base_price_cents: number
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
