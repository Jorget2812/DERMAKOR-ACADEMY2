import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Service role client for bypassing RLS during webhook processing
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    let event: Stripe.Event

    try {
        if (!signature || !endpointSecret) throw new Error('Missing stripe signature or secret')
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // Handle Idempotency
    const { data: existingEvent } = await supabaseAdmin
        .from('stripe_events')
        .select('event_id')
        .eq('event_id', event.id)
        .single()

    if (existingEvent) {
        return NextResponse.json({ received: true, already_processed: true })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract data
        const userId = session.metadata?.userId
        const shippingAddress = JSON.parse(session.metadata?.shippingAddress || '{}')

        if (!userId) {
            console.error("No userId in session metadata")
            return NextResponse.json({ error: "No userId" }, { status: 400 })
        }

        // Fetch Line Items to get variant details
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product'],
        })

        try {
            // Transaction-like flow (manual since we're in JS, but RPC could do it all too)
            // 1. Create Order
            const { data: order, error: orderError } = await supabaseAdmin
                .from('orders')
                .insert({
                    user_id: userId,
                    status: 'PAID',
                    currency: 'CHF',
                    total_base_cents: session.amount_subtotal || 0,
                    total_discount_cents: session.total_details?.amount_discount || 0,
                    vat_total_cents: session.total_details?.amount_tax || 0,
                    total_final_cents: session.amount_total || 0,
                    shipping_cost_cents: session.shipping_cost?.amount_total || 0,
                    shipping_address: shippingAddress,
                    stripe_session_id: session.id
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create Order Items and Decrement Stock
            for (const item of lineItems.data) {
                const variantId = (item.price?.product as Stripe.Product)?.metadata?.variantId

                if (!variantId) continue

                // Add order item
                const { error: itemError } = await supabaseAdmin
                    .from('order_items')
                    .insert({
                        order_id: order.id,
                        variant_id: variantId,
                        qty: item.quantity || 1,
                        base_unit_price_cents: item.price?.unit_amount || 0,
                        discount_percent: 0, // Simplified for now
                        net_unit_price_cents: item.price?.unit_amount || 0,
                        vat_rate: 0, // Simplified
                        vat_amount_cents: 0,
                        gross_unit_price_cents: item.price?.unit_amount || 0,
                        line_total_cents: item.amount_total
                    })

                if (itemError) console.error("Item insert error:", itemError)

                // Decrement stock safe
                const { data: stockOk, error: stockError } = await supabaseAdmin.rpc('decrement_stock_safe', {
                    p_variant_id: variantId,
                    p_qty: item.quantity || 1
                })

                if (stockError || !stockOk) {
                    console.error(`Stock update failed for variant ${variantId}:`, stockError)
                    // In a real system, you might trigger a notification for low stock/oversell
                }
            }

            // 3. Mark event as processed
            await supabaseAdmin.from('stripe_events').insert({ event_id: event.id })

        } catch (dbError: any) {
            console.error("Database processing error:", dbError)
            return NextResponse.json({ error: "Internal processing error" }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true })
}
