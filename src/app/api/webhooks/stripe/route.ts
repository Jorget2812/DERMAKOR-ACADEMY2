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
        console.log(`[Stripe Webhook] Processing event: ${event.id}`)

        // PASO 1: Extraer orderId del metadata
        const orderId = session.metadata?.orderId
        if (!orderId) {
            console.error('[Stripe Webhook] No orderId in metadata')
            return NextResponse.json({ error: 'No orderId' }, { status: 400 })
        }

        try {
            // PASO 2: Buscar orden existente
            const { data: existingOrder, error: fetchError } = await supabaseAdmin
                .from('orders')
                .select('id, status, user_id')
                .eq('id', orderId)
                .single()

            if (fetchError || !existingOrder) {
                console.error(`[Stripe Webhook] Order not found: ${orderId}`, fetchError)
                return NextResponse.json({ error: 'Order not found' }, { status: 400 })
            }

            // PASO 3: Idempotencia de orden
            if (existingOrder.status === 'PAID') {
                console.log(`[Stripe Webhook] Order already paid: ${orderId}`)
                return NextResponse.json({ received: true, already_paid: true })
            }

            if (existingOrder.status !== 'PENDING') {
                console.error(`[Stripe Webhook] Unexpected order status: ${existingOrder.status} for order ${orderId}`)
                return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
            }

            // PASO 4: Marcar como pagada via RPC
            const { error: paidError } = await supabaseAdmin.rpc('mark_order_paid', {
                p_order_id: orderId
            })

            if (paidError) {
                console.error(`[Stripe Webhook] mark_order_paid failed for ${orderId}:`, paidError)
                throw new Error('mark_order_paid failed')
            }

            // PASO 5: Decrementar stock por cada item
            const { data: orderItems, error: itemsError } = await supabaseAdmin
                .from('order_items')
                .select('variant_id, qty')
                .eq('order_id', orderId)

            if (itemsError) {
                console.error(`[Stripe Webhook] Error fetching items for order ${orderId}:`, itemsError)
                throw itemsError
            }

            for (const item of orderItems ?? []) {
                const { data: stockOk, error: stockError } = await supabaseAdmin.rpc('decrement_stock_safe', {
                    p_variant_id: item.variant_id,
                    p_qty: item.qty
                })

                if (!stockOk || stockError) {
                    // Stock insuficiente: loguear en audit pero NO revertir
                    // El pago ya ocurrió, el admin debe gestionar manualmente
                    await supabaseAdmin.from('audit_logs').insert({
                        action: 'STOCK_ALERT',
                        resource_type: 'product_variant',
                        resource_id: item.variant_id,
                        payload: {
                            order_id: orderId,
                            qty_requested: item.qty,
                            message: 'Stock insuficiente post-pago Stripe',
                            error: stockError?.message || 'Manual intervention needed'
                        }
                    })
                    console.error(`[Stripe Webhook] STOCK ALERT variant: ${item.variant_id} for order ${orderId}`)
                } else {
                    console.log(`[Stripe Webhook] Stock decremented for variant: ${item.variant_id}`)
                }
            }

            // PASO 6: Marcar evento procesado
            await supabaseAdmin.from('stripe_events').insert({
                event_id: event.id
            })

            console.log(`[Stripe Webhook] Order completed successfully: ${orderId}`)

        } catch (dbError: any) {
            console.error("[Stripe Webhook] Database processing error:", dbError)
            return NextResponse.json({ error: "Internal processing error" }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true })
}
