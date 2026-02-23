'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'
import { auditLog } from './admin-actions'


import { generateAndUploadInvoice } from '@/lib/invoice-service'

/**
 * List all orders.
 */
export async function getAdminOrders() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            profiles (full_name, email, level),
            order_items (*)
        `)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

/**
 * Get detailed order for admin.
 */
export async function getAdminOrder(id: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            profiles (*),
            order_items (
                *,
                product_variants (
                    sku,
                    products (name)
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) throw new Error(error.message)
    return data
}

/**
 * Mark an order as Paid.
 * Rule: Decrements stock idempotently (only once).
 */
export async function markOrderPaid(orderId: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // 1. Get current status and items
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            status,
            order_items (variant_id, qty)
        `)
        .eq('id', orderId)
        .single()

    if (orderError || !order) throw new Error("Commande introuvable")

    // 2. Guards
    if (order.status === 'PAID') return { success: true, message: "Déjà payée" }
    if (order.status === 'CANCELLED') throw new Error("Impossible de payer une commande annulée")

    // 3. Decrement Stock (Idempotent)
    // We only reach this if status was PENDING
    for (const item of (order.order_items as any[])) {
        if (item.variant_id && item.qty) {
            const { data: ok, error: rpcError } = await supabase.rpc('decrement_stock_safe', {
                p_variant_id: item.variant_id,
                p_qty: item.qty
            })
            if (rpcError || !ok) throw new Error(`Stock insuffisant pour une variante (${item.variant_id})`)
        }
    }

    // 4. Update order status
    const { error: updateError } = await supabase
        .from('orders')
        .update({
            status: 'PAID',
            paid_at: new Date().toISOString()
        } as any)
        .eq('id', orderId)

    if (updateError) throw new Error(updateError.message)

    // Audit Log
    await auditLog('ORDER_MARK_PAID', 'orders', orderId, { status: 'PAID' })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
}

/**
 * Cancel an order.
 * Rule: NO stock restoration because it's no longer deducted on creation.
 */
export async function cancelOrder(orderId: string, reason?: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // 1. Get order details for guards
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

    if (orderError || !order) throw new Error("Commande introuvable")

    // 2. Guards
    if (order.status === 'PAID') throw new Error("Impossible d'annuler une commande déjà payée")
    if (order.status === 'CANCELLED') return { success: true, message: "Déjà annulée" }

    // 3. Update status (No stock restoration needed)
    const { error: updateError } = await supabase
        .from('orders')
        .update({
            status: 'CANCELLED',
            cancelled_at: new Date().toISOString()
        } as any)
        .eq('id', orderId)

    if (updateError) throw new Error(updateError.message)

    // Audit Log
    await auditLog('ORDER_CANCELLED', 'orders', orderId, { status: 'CANCELLED', reason })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
}

/**
 * Generate Invoice PDF and upload to Storage.
 */
export async function generateInvoicePDF(orderId: string) {
    await ensureAdmin()

    try {
        const result = await generateAndUploadInvoice(orderId)
        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${orderId}`)
        return result
    } catch (e: any) {
        console.error("PDF Generation Error:", e.message)
        throw new Error(`Erreur de génération: ${e.message}`)
    }
}
