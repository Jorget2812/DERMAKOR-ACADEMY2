'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'

/**
 * Update level discounts for a specific month.
 */
export async function updateMonthlyDiscount(year_month: string, level: Database['public']['Enums']['user_level'], percent: number) {
    await ensureAdmin()
    const supabase = await createClient()

    // Validate limits
    if (level === 'STANDARD' && percent > 30) throw new Error("Le rabais Standard ne peut excéder 30%")
    if (level === 'PREMIUM' && percent > 50) throw new Error("Le rabais Premium ne peut excéder 50%")
    if (level === 'NONE' && percent !== 0) throw new Error("Le rabais Public doit être 0%")

    const { error } = await supabase
        .from('monthly_discounts')
        .upsert({
            year_month,
            level,
            percent
        }, { onConflict: 'year_month,level' })

    if (error) throw new Error(error.message)

    // Audit Log
    await supabase.from('audit_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'UPDATE_MONTHLY_DISCOUNT',
        resource_type: 'monthly_discounts',
        payload: { year_month, level, percent }
    })

    revalidatePath('/admin/discounts')
    return { success: true }
}

/**
 * Manage category overrides.
 */
export async function updateCategoryDiscount(year_month: string, categoryId: string, level: Database['public']['Enums']['user_level'], percent: number) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('category_discounts')
        .upsert({
            year_month,
            category_id: categoryId,
            level,
            percent
        }, { onConflict: 'year_month,level,category_id' })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/discounts')
    return { success: true }
}

