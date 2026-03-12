import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

import { webhookLimiter } from '@/lib/rate-limit'

const log = logger('stripe-webhook')

// Stripe client is safe to instantiate at module level (no sensitive data in constructor)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
})

export async function POST(req: Request) {
    // 0. Rate limiting (Global for webhooks)
    const { success } = await webhookLimiter.limit('stripe-global')
    if (!success) {
        log.warn('Webhook global rate limit exceeded')
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event

    try {
        if (!signature || !endpointSecret) throw new Error('Missing stripe signature or secret')
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        log.error('Webhook signature verification failed', {}, err)
        return NextResponse.json({ error: msg }, { status: 400 })
    }

    // Supabase admin client is created per-request (not module-level)
    // to ensure env vars are validated at request time, not at cold start
    const supabaseAdmin = createAdminClient()

    // Idempotency: skip already-processed events
    const { data: existingEvent } = await supabaseAdmin
        .from('stripe_events')
        .select('event_id')
        .eq('event_id', event.id)
        .single()

    if (existingEvent) {
        log.info('Event already processed, skipping', { eventId: event.id })
        return NextResponse.json({ received: true, already_processed: true })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        log.info('Processing checkout.session.completed', { eventId: event.id })

        const orderId = session.metadata?.orderId
        if (!orderId) {
            log.error('No orderId in Stripe session metadata', { eventId: event.id })
            return NextResponse.json({ error: 'No orderId' }, { status: 400 })
        }

        try {
            // Fetch order
            const { data: existingOrder, error: fetchError } = await supabaseAdmin
                .from('orders')
                .select('id, status, user_id')
                .eq('id', orderId)
                .single()

            if (fetchError || !existingOrder) {
                log.error('Order not found', { orderId, eventId: event.id }, fetchError)
                return NextResponse.json({ error: 'Order not found' }, { status: 400 })
            }

            // Idempotency: skip already-paid orders
            if (existingOrder.status === 'PAID') {
                log.info('Order already paid, skipping', { orderId })
                return NextResponse.json({ received: true, already_paid: true })
            }

            if (existingOrder.status !== 'PENDING') {
                log.error('Unexpected order status', { orderId, status: existingOrder.status })
                return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
            }

            // Mark order as paid
            const { error: paidError } = await supabaseAdmin.rpc('mark_order_paid', {
                p_order_id: orderId
            })

            if (paidError) {
                log.error('mark_order_paid failed', { orderId }, paidError)
                throw new Error('mark_order_paid failed')
            }

            // Decrement stock for each item
            const { data: orderItems, error: itemsError } = await supabaseAdmin
                .from('order_items')
                .select('variant_id, qty')
                .eq('order_id', orderId)

            if (itemsError) {
                log.error('Error fetching order items', { orderId }, itemsError)
                throw itemsError
            }

            for (const item of orderItems ?? []) {
                if (!item.variant_id) {
                    log.warn('Order item missing variant_id, skipping stock decrement', { orderId })
                    continue
                }
                const { data: stockOk, error: stockError } = await supabaseAdmin.rpc('decrement_stock_safe', {
                    p_variant_id: item.variant_id,
                    p_qty: item.qty
                })

                if (!stockOk || stockError) {
                    // Stock insufficient: log alert but do NOT revert — payment already captured.
                    // Admin must handle manually. This will be visible in audit_logs.
                    await supabaseAdmin.from('audit_logs').insert({
                        action: 'STOCK_ALERT',
                        resource_type: 'product_variant',
                        resource_id: item.variant_id,
                        payload: {
                            order_id: orderId,
                            qty_requested: item.qty,
                            message: 'Stock insuficiente post-pago Stripe',
                            error: stockError?.message ?? 'Manual intervention needed',
                        },
                    })
                    log.error('STOCK ALERT — insufficient stock after payment', {
                        variantId: item.variant_id,
                        orderId,
                        qty: item.qty,
                    })
                } else {
                    log.debug('Stock decremented', { variantId: item.variant_id, qty: item.qty })
                }
            }

            // Record processed event (idempotency guard)
            await supabaseAdmin.from('stripe_events').insert({ event_id: event.id })

            log.info('Order completed successfully', { orderId, eventId: event.id })

        } catch (dbError: unknown) {
            log.error('Database processing error', { orderId, eventId: event.id }, dbError)
            return NextResponse.json({ error: 'Internal processing error' }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true })
}
