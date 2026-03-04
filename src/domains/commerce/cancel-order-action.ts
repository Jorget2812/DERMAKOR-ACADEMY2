'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Cancel an order — accessible by the order owner only.
 * Rules:
 *  - Order must belong to the authenticated user
 *  - Only PENDING orders can be cancelled (not PAID, SHIPPED, etc.)
 *  - Restores stock for each order_item
 *  - Sets order.status = 'CANCELLED'
 */
export async function cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Non authentifié' }

        // 1. Fetch order and verify ownership + status
        const { data: order, error: fetchErr } = await supabase
            .from('orders')
            .select('id, status, user_id, order_items(id, qty, product_variants(id))')
            .eq('id', orderId)
            .eq('user_id', user.id)   // security: only owner
            .single()

        if (fetchErr || !order) return { success: false, error: 'Commande introuvable' }
        if (order.status !== 'PENDING') {
            return { success: false, error: 'Seules les commandes en attente peuvent être annulées' }
        }

        // 2. Restore stock for each line item
        const items = (order as any).order_items || []
        for (const item of items) {
            const variantId = item.product_variants?.id
            if (!variantId) continue

            // Read current stock then increment
            const { data: variant } = await supabase
                .from('product_variants')
                .select('stock_count')
                .eq('id', variantId)
                .single()

            const currentStock = variant?.stock_count ?? 0
            await supabase
                .from('product_variants')
                .update({ stock_count: currentStock + item.qty })
                .eq('id', variantId)
        }

        // 3. Mark order as CANCELLED
        const { error: updateErr } = await supabase
            .from('orders')
            .update({ status: 'CANCELLED' })
            .eq('id', orderId)
            .eq('user_id', user.id)

        if (updateErr) return { success: false, error: updateErr.message }

        // 4. Revalidate client and admin order pages
        revalidatePath('/app/orders')
        revalidatePath(`/app/orders/${orderId}`)
        revalidatePath('/admin/orders')

        return { success: true }
    } catch (err: any) {
        console.error('[cancelOrder]', err)
        return { success: false, error: err.message || 'Erreur inattendue' }
    }
}
