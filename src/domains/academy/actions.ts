'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/types'


/**
 * Verified (Standard/Premium): List courses with level-based visibility
 */
export async function listCourses() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('courses')
        .select('*, modules(*, lessons(id, title, position))')
        .eq('active', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Academy fetch error:", error)
        return []
    }

    return data || []
}

/**
 * Verified (Standard/Premium): Get full lesson content
 */
export async function getLesson(lessonId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('lessons')
        .select('*, module:modules(*, course:courses(title))')

        .eq('id', lessonId)
        .single()

    if (error) return null
    return data
}

/**
 * Verified (Standard/Premium): Update lesson progress
 */
export async function updateProgress(lessonId: string, completed: boolean, position: number = 0) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            status: (completed ? 'COMPLETED' : 'STARTED'), // status is TEXT in schema but we should be careful
            last_position_sec: position,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        })


    if (error) console.error("Progress update error:", error)
    revalidatePath('/app/academy')
}

/**
 * Verified (Standard/Premium): Generate signed URL for PDF resources
 */
export async function getResourceUrl(path: string) {
    const supabase = await createClient()

    // Security: The RLS on 'lessons' or 'library' should ideally govern access, 
    // but we also double check here.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Accès refusé")

    const { data, error } = await supabase.storage
        .from('academy_resources')
        .createSignedUrl(path, 60) // 60 seconds expiry

    if (error) throw new Error("Erreur de lien")
    return data.signedUrl
}

/**
 * Verified (Standard/Premium): Get current progress for a lesson
 */
export async function getLessonProgress(lessonId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single()

    if (error) return null
    return data
}

/**
 * Verified (Standard/Premium): Get single course details
 */
export async function getCourse(slug: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('courses')
        .select('*, modules(*, lessons(id, title, position, visibility))')
        .eq('slug', slug)
        .eq('active', true)
        .single()

    if (error) return null

    const course = data as any
    // Sort modules and lessons by position
    if (course.modules) {
        course.modules.sort((a: any, b: any) => a.position - b.position)
        course.modules.forEach((mod: any) => {
            if (mod.lessons) {
                mod.lessons.sort((a: any, b: any) => a.position - b.position)
            }
        })
    }

    return course
}
