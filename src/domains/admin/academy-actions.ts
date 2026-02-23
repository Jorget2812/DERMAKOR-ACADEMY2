'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'


/**
 * List all courses with their modules and lessons.
 */
export async function getAdminCourses() {
    await ensureAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('courses')
        .select(`
      *,
      modules (
        *,
        lessons (*)
      )
    `)
        .order('created_at')

    if (error) throw new Error(error.message)
    return data
}

/**
 * Create or update a course.
 */
export async function upsertCourse(course: any) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('courses')
        .upsert({
            ...course,
            slug: course.slug || course.title.toLowerCase().replace(/ /g, '-')
        })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/academy')
    return { success: true }
}

/**
 * Create or update a lesson with visibility rules.
 */
export async function upsertLesson(lesson: any) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('lessons')
        .upsert(lesson)

    if (error) throw new Error(error.message)

    // Audit Log
    await supabase.from('audit_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'UPSERT_LESSON',
        resource_type: 'lessons',
        resource_id: lesson.id || 'new',
        payload: { title: lesson.title }
    })


    revalidatePath('/admin/academy')
    return { success: true }
}
