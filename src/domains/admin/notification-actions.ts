'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAdminNotificationCounts() {
    const supabase = await createClient()

    // Contar pedidos EN ATTENTE (pending)
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')

    // Contar verificaciones pendientes
    const { count: pendingVerifications } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')

    return {
        pendingOrders: pendingOrders ?? 0,
        pendingVerifications: pendingVerifications ?? 0,
    }
}
