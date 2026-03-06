'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { getPendingVerifications as fetchPendingVerifications } from './verification-actions'
import { sendInvitationEmail } from '@/lib/email-service'
import crypto from 'crypto'

/**
 * Audit Logger Helper
 */
export async function auditLog(action: string, resourceType: string, resourceId?: string, payload?: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('audit_logs').insert([{
        admin_id: user?.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        payload
    }])
}

/**
 * Admin Access Guard
 */
async function adminCheck() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Accès non autorisé")

    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) throw new Error("Accès admin requis")

    return user
}


export async function getPendingVerifications() {
    return await fetchPendingVerifications()
}

/**
 * Admin Dashboard Stats
 */
export async function getAdminDashboardStats() {
    await ensureAdmin()
    const supabase = await createClient()

    // 1. Monthly Sales (Current month)
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('total_final_cents')
        .gte('created_at', firstDay)
        .eq('status', 'PAID')

    const monthlySalesCents = (monthlyOrders || []).reduce((acc, o) => acc + (o.total_final_cents || 0), 0)
    const monthlySales = (monthlySalesCents / 100).toFixed(2)

    // 2. Active Pros
    const { count: activePros } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')
        .eq('verification_status', 'APPROVED')

    // 3. Pending Verifications
    const { count: pendingVerifications } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')

    // 4. Low Stock Alerts (threshold < 10)
    const { data: lowStockItems } = await supabase
        .from('product_variants')
        .select(`
            stock_count,
            products ( name )
        `)
        .lt('stock_count', 10)
        .eq('active', true)
        .order('stock_count', { ascending: true })
        .limit(5)

    // 5. Daily Orders
    const { data: dailyOrders } = await supabase
        .from('orders')
        .select('total_final_cents')
        .gte('created_at', todayStart)

    const dailyStats = {
        count: dailyOrders?.length || 0,
        total: ((dailyOrders || []).reduce((acc, o) => acc + (o.total_final_cents || 0), 0) / 100).toFixed(2)
    }

    return {
        monthlySales: monthlySales,
        activePros: activePros || 0,
        pendingVerifications: pendingVerifications || 0,
        lowStockItems: (lowStockItems || []).map(i => ({
            name: (i.products as any)?.name || 'Produit',
            stock: i.stock_count
        })),
        dailyStats
    }
}

/**
 * Admin Analytics Stats
 */
export async function getAnalyticsStats() {
    await ensureAdmin()
    // Use ADMIN client to bypass RLS and see all orders for the report
    const supabase = createAdminClient()

    const now = new Date()
    const months = []

    // 1. Calculate the range (Last 6 months)
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    startDate.setHours(0, 0, 0, 0)

    // Fetch all relevant data once
    const { data: allOrders } = await supabase
        .from('orders')
        .select('total_final_cents, created_at, status')
        .gte('created_at', startDate.toISOString())

    const { data: allProfiles } = await supabase
        .from('profiles')
        .select('created_at, verification_status')
        .gte('created_at', startDate.toISOString())

    const { data: allItems } = await supabase
        .from('order_items')
        .select(`
            qty,
            line_total_cents,
            product_variants (
                products (name)
            )
        `)

    // 2. Group data by month in JS
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthIndex = d.getMonth()
        const year = d.getFullYear()

        const monthOrders = (allOrders || []).filter(o => {
            if (!o.created_at) return false
            const od = new Date(o.created_at)
            return od.getMonth() === monthIndex && od.getFullYear() === year && o.status === 'PAID'
        })

        const salesCents = monthOrders.reduce((sum, o) => sum + (o.total_final_cents || 0), 0)

        const monthUsersCount = (allProfiles || []).filter(p => {
            if (!p.created_at) return false
            const ud = new Date(p.created_at)
            return ud.getMonth() === monthIndex && ud.getFullYear() === year && p.verification_status === 'APPROVED'
        }).length

        const label = d.toLocaleString('fr-CH', { month: 'short' }).toUpperCase()
        const yearSuffix = year.toString().slice(-2)

        months.push({
            month: `${label} ${yearSuffix}`,
            sales: salesCents / 100,
            users: monthUsersCount
        })
    }

    // 3. KPIs
    const currentMonthStats = months[months.length - 1]
    const prevMonthStats = months[months.length - 2]

    let salesGrowth = 0
    if (prevMonthStats && prevMonthStats.sales > 0) {
        salesGrowth = ((currentMonthStats.sales - prevMonthStats.sales) / prevMonthStats.sales) * 100
    }

    const currentMonthOrders = (allOrders || []).filter(o => {
        if (!o.created_at) return false
        const od = new Date(o.created_at)
        return od.getMonth() === now.getMonth() && od.getFullYear() === now.getFullYear()
    })

    const avgBasketCents = currentMonthOrders.length
        ? currentMonthOrders.reduce((sum, o) => sum + (o.total_final_cents || 0), 0) / currentMonthOrders.length
        : 0

    // 4. Top Products (Aggregated)
    const aggregation: Record<string, { quantity: number, total_price_cents: number }> = {}

    allItems?.forEach(item => {
        const name = (item.product_variants as any)?.products?.name || 'Produit'
        if (!aggregation[name]) {
            aggregation[name] = { quantity: 0, total_price_cents: 0 }
        }
        aggregation[name].quantity += item.qty
        aggregation[name].total_price_cents += item.line_total_cents
    })

    const topProducts = Object.entries(aggregation)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total_price_cents - a.total_price_cents)
        .slice(0, 5)

    return {
        topProducts,
        monthlyGrowth: months,
        salesGrowth: salesGrowth.toFixed(1),
        newPros: currentMonthStats.users,
        averageBasket: (avgBasketCents / 100).toFixed(2)
    }
}

// --- VERIFICATIONS ---

export async function approveVerification(requestId: string, initialLevel: 'STANDARD' | 'PREMIUM' = 'STANDARD') {
    try {
        console.log('[approveVerification] Starting approval for requestId:', requestId)
        const adminUser = await adminCheck()
        const supabase = await createClient()
        const adminClient = createAdminClient()

        // Verify SMTP config exists
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('[approveVerification] SMTP credentials missing in environment')
            throw new Error("Configuration e-mail SMTP manquante sur le serveur.")
        }

        // 1. Get request details
        const { data: request, error: fetchError } = await adminClient
            .from('verification_requests')
            .select('*')
            .eq('id', requestId)
            .single()

        if (fetchError || !request) {
            console.error('[approveVerification] Request not found or error:', { requestId, error: fetchError })
            throw new Error("Demande introuvable o error de acceso.")
        }

        // 2. Create auth user via generateLink
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dermakor-academy.vercel.app'
        let userId: string

        console.log('[approveVerification] Generating invite link for:', request.email)
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
            type: 'invite',
            email: request.email,
            options: { data: { full_name: request.full_name } }
        })

        if (linkError) {
            if (linkError.message.toLowerCase().includes('already registered') ||
                linkError.message.toLowerCase().includes('already exists')) {
                console.log('[approveVerification] User already exists in auth, finding profile')
                const { data: existingProfile } = await adminClient
                    .from('profiles')
                    .select('id')
                    .eq('email', request.email)
                    .single()

                if (!existingProfile) throw new Error('Profil introuvable pour cet email (utilisateur existant).')
                userId = existingProfile.id
            } else {
                console.error('[approveVerification] Auth error:', linkError.message)
                throw new Error(`Erreur creación compte: ${linkError.message}`)
            }
        } else {
            userId = linkData.user.id
        }

        // 3. Generate custom token
        const inviteToken = crypto.randomBytes(32).toString('hex')
        console.log('[approveVerification] Storing custom token for userId:', userId)

        const { error: tokenInsertError } = await (adminClient as any)
            .from('invitation_tokens')
            .insert({
                user_id: userId,
                email: request.email,
                token: inviteToken,
                used: false,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })

        if (tokenInsertError) {
            console.error('[approveVerification] Token DB error:', tokenInsertError.message)
            throw new Error(`Token DB error: ${tokenInsertError.message}`)
        }

        const inviteLink = `${siteUrl}/fr/auth/set-password?token=${inviteToken}`

        // 4. Send email mapping via Hostinger SMTP
        console.log('[approveVerification] Sending invitation email to:', request.email)
        try {
            await sendInvitationEmail({
                to: request.email,
                fullName: request.full_name,
                inviteLink,
            })
        } catch (emailErr: any) {
            console.error('[approveVerification] SMTP failed:', emailErr.message)
            throw new Error(`Échec de l'envoi de l'e-mail: ${emailErr.message}`)
        }

        console.log('[approveVerification] Updating profile and request status')
        await updateProfileAndRequest(adminClient, requestId, userId, request, initialLevel, adminUser.id)
        await auditLog('APPROVE_VERIFICATION', 'verification_requests', requestId, { email: request.email })

        revalidatePath('/admin')
        revalidatePath('/admin/verifications')
        console.log('[approveVerification] Success')
        return { success: true }
    } catch (err: any) {
        console.error('[approveVerification] CRITICAL ERROR:', err.message)
        throw err // Re-throw to be caught by client UI
    }
}


async function updateProfileAndRequest(adminClient: any, requestId: string, userId: string, request: any, initialLevel: string, adminId: string) {
    // Update request
    const { error: reqError } = await adminClient.from('verification_requests').update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
    }).eq('id', requestId)

    if (reqError) {
        console.error('[updateProfileAndRequest] Error updating request:', reqError)
        throw new Error(`Error DB request: ${reqError.message}`)
    }

    // Upsert profile
    const { error: upsertError } = await adminClient.from('profiles').upsert({
        id: userId,
        email: request.email as string,
        full_name: request.full_name as string,
        verification_status: 'APPROVED' as any,
        status: 'ACTIVE' as any,
        level: initialLevel as any,
        company_name: request.company_name as string,
        phone_pro: request.phone_pro as string,
        address_pro: request.address_pro as string
    }, { onConflict: 'id' })

    if (upsertError) {
        console.error('[updateProfileAndRequest] Error upserting profile:', upsertError)
        throw new Error(`Error DB profile: ${upsertError.message}`)
    }
}

export async function rejectVerification(requestId: string, reason: string) {
    await adminCheck()
    const supabase = await createClient()

    const { error } = await supabase
        .from('verification_requests')
        .update({ status: 'REJECTED', admin_notes: reason })
        .eq('id', requestId)

    if (error) throw new Error(error.message)

    await auditLog('REJECT_VERIFICATION', 'verification_requests', requestId, { reason })

    revalidatePath('/admin/verifications')
    return { success: true }
}

// --- USERS ---

export async function updateUserProfile(userId: string, data: { level?: 'NONE' | 'STANDARD' | 'PREMIUM', status?: 'ACTIVE' | 'SUSPENDED' }) {
    await adminCheck()
    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)

    if (error) throw new Error(error.message)

    await auditLog('UPDATE_USER', 'profiles', userId, data)

    revalidatePath('/admin/users')
    return { success: true }
}

// --- PRODUCTS & INVENTORY ---

export async function upsertProduct(product: any) {
    await adminCheck()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .upsert(product)
        .select()
        .single()

    if (error) throw new Error(error.message)

    await auditLog(product.id ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', 'products', data.id, product)

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products/inventory')
    revalidatePath('/app/shop')
    return { success: true, data }
}

export async function upsertVariant(variant: any) {
    await adminCheck()
    const supabase = await createClient()

    // Asegurar que stock_count nunca sea nulo
    const validatedVariant = {
        ...variant,
        stock_count: Math.max(0, Math.floor(variant.stock_count || 0))
    }

    const { data, error } = await supabase
        .from('product_variants')
        .upsert(validatedVariant)
        .select()
        .single()

    if (error) throw new Error(error.message)

    await auditLog(variant.id ? 'UPDATE_VARIANT' : 'CREATE_VARIANT', 'product_variants', data.id, variant)

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products/inventory')
    return { success: true, data }
}

export async function updateInventoryStock(variantId: string, newStock: number) {
    await adminCheck()
    const supabase = await createClient()

    const sanitizedStock = Math.max(0, Math.floor(newStock || 0))

    const { error } = await supabase
        .from('product_variants')
        .update({ stock_count: sanitizedStock })
        .eq('id', variantId)
    if (error) throw new Error(error.message)

    await auditLog('UPDATE_STOCK', 'product_variants', variantId, { stock_count: newStock })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products/inventory')
    return { success: true }
}

export async function deleteVariant(variantId: string) {
    await adminCheck()
    const supabase = await createClient()

    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

    if (error) throw new Error(error.message)

    await auditLog('DELETE_VARIANT', 'product_variants', variantId, {})

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products/inventory')
    return { success: true }
}

// --- DISCOUNTS ---

export async function updateMonthlyDiscount(yearMonth: string, level: 'STANDARD' | 'PREMIUM', percent: number) {
    await adminCheck()
    const supabase = await createClient()

    const { error } = await supabase
        .from('monthly_discounts')
        .upsert({ year_month: yearMonth, level, percent }, { onConflict: 'year_month,level' })

    if (error) throw new Error(error.message)

    await auditLog('UPDATE_MONTHLY_DISCOUNT', 'monthly_discounts', `${yearMonth}-${level}`, { percent })

    revalidatePath('/admin/discounts')
    return { success: true }
}

// --- ORDERS ---

export async function getOrderDetails(orderId: string) {
    await adminCheck()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                product_variants (
                    sku,
                    products (name)
                )
            ),
            profiles (*)
        `)
        .eq('id', orderId)
        .single()

    if (error) throw new Error(error.message)
    return data
}
