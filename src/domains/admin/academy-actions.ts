'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureAdmin } from '@/lib/auth/admin-guard'
import { revalidatePath } from 'next/cache'
import { canAccessLevel } from './academy-utils'
import type { CourseAccessLevel, LessonAccessLevel } from './academy-utils'

export type { CourseAccessLevel, LessonAccessLevel, UserLevel } from './academy-utils'

// ──────────────────────────────────────────────
// COURSES
// ──────────────────────────────────────────────

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
export async function upsertCourse(course: {
    id?: string
    title: string
    slug?: string
    description?: string
    thumbnail_url?: string
    access_level?: CourseAccessLevel
    price?: number | null
    order_index?: number
    active?: boolean
}) {
    await ensureAdmin()
    const supabase = createAdminClient()

    const slug = course.slug || course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

    // Map access_level → content_visibility enum (valid values: STANDARD_ONLY | PREMIUM_ONLY | BOTH)
    const visibilityMap: Record<string, string> = {
        PUBLIC: 'BOTH',           // visible to all verified users
        STANDARD: 'STANDARD_ONLY', // standard + premium
        PREMIUM: 'PREMIUM_ONLY',  // premium only
        PAID: 'PREMIUM_ONLY',     // treated as premium until migration adds access_level
    }
    const visibility = visibilityMap[course.access_level || 'STANDARD'] || 'STANDARD_ONLY'

    const payload: any = {
        id: course.id,
        title: course.title,
        slug,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        visibility,
        access_level: course.access_level || 'STANDARD',
        price: course.access_level === 'PAID' ? (course.price || null) : null,
        active: course.active ?? true,
    }

    const { data, error } = await (supabase as any)
        .from('courses')
        .upsert(payload)
        .select()
        .single()

    if (error) throw new Error(error.message)
    revalidatePath('/admin/academy')
    return { success: true, data }
}

/**
 * Delete a course.
 */
export async function deleteCourse(courseId: string) {
    await ensureAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/academy')
    return { success: true }
}

// ──────────────────────────────────────────────
// MODULES
// ──────────────────────────────────────────────

/**
 * Create or update a module.
 */
export async function upsertModule(module: {
    id?: string
    course_id: string
    title: string
    description?: string
    order_index?: number
}) {
    await ensureAdmin()
    const supabase = createAdminClient()

    // Use 'position' (existing column) mapped from order_index
    const payload: any = {
        id: module.id,
        course_id: module.course_id,
        title: module.title,
        position: module.order_index ?? 0,
    }

    const { data, error } = await (supabase as any)
        .from('modules')
        .upsert(payload)
        .select()
        .single()

    if (error) throw new Error(error.message)
    revalidatePath('/admin/academy')
    return { success: true, data }
}

/**
 * Delete a module (cascades to lessons).
 */
export async function deleteModule(moduleId: string) {
    await ensureAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('modules').delete().eq('id', moduleId)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/academy')
    return { success: true }
}

// ──────────────────────────────────────────────
// LESSONS
// ──────────────────────────────────────────────

/**
 * Create or update a lesson with full media + access control.
 */
export async function upsertLesson(lesson: {
    id?: string
    module_id: string
    title: string
    content?: string
    video_url?: string | null
    pdf_url?: string | null
    duration_minutes?: number
    order_index?: number
    access_level?: LessonAccessLevel
    is_free_preview?: boolean
}) {
    await ensureAdmin()
    const supabase = createAdminClient()

    // Store video_url + pdf_url as JSON in 'content' field until migration runs
    // Format: JSON prefix so we can detect it later
    const existingContent = lesson.content || ''
    let contentToSave = existingContent

    if (lesson.video_url || lesson.pdf_url) {
        const meta = { video_url: lesson.video_url || null, pdf_url: lesson.pdf_url || null, duration_minutes: lesson.duration_minutes || 0 }
        // Prepend metadata marker
        const textPart = existingContent.split('__ENDMETA__').slice(1).join('__ENDMETA__').replace(/^\n/, '')
        contentToSave = `__META__${JSON.stringify(meta)}__ENDMETA__\n${textPart}`.trim()
    }

    // Map access_level → content_visibility enum (valid values: STANDARD_ONLY | PREMIUM_ONLY | BOTH)
    const visibilityMap: Record<string, string> = {
        INHERIT: 'STANDARD_ONLY',
        PUBLIC: 'BOTH',
        STANDARD: 'STANDARD_ONLY',
        PREMIUM: 'PREMIUM_ONLY',
        PAID: 'PREMIUM_ONLY',
    }
    const visibility = visibilityMap[lesson.access_level || 'INHERIT'] || 'STANDARD_ONLY'

    const payload: any = {
        id: lesson.id,
        module_id: lesson.module_id,
        title: lesson.title,
        content: contentToSave,
        position: lesson.order_index ?? 0,
        visibility,
    }

    const { data, error } = await (supabase as any)
        .from('lessons')
        .upsert(payload)
        .select()
        .single()

    if (error) throw new Error(error.message)
    revalidatePath('/admin/academy')
    return { success: true, data }
}

/**
 * Delete a lesson.
 */
export async function deleteLesson(lessonId: string) {
    await ensureAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/academy')
    return { success: true }
}

// ──────────────────────────────────────────────
// FILE UPLOADS (Supabase Storage signed URLs)
// ──────────────────────────────────────────────

/**
 * Generate a signed upload URL for a video or PDF.
 * Returns the signed URL for the client to upload directly.
 */
export async function getSignedUploadUrl(
    bucket: 'academy-videos' | 'academy-pdfs',
    path: string
): Promise<{ signedUrl: string; token: string; path: string }> {
    await ensureAdmin()
    const supabase = createAdminClient()

    const { data, error } = await (supabase as any).storage
        .from(bucket)
        .createSignedUploadUrl(path)

    if (error) throw new Error(error.message)
    return data
}

/**
 * Get a signed download URL for a video or PDF for verified students.
 */
export async function getSignedDownloadUrl(
    bucket: 'academy-videos' | 'academy-pdfs',
    path: string,
    expiresIn = 3600
): Promise<string> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const adminClient = createAdminClient()
    const { data, error } = await (adminClient as any).storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

    if (error) throw new Error(error.message)
    return data.signedUrl
}

// ──────────────────────────────────────────────
// QUIZZES
// ──────────────────────────────────────────────

export interface QuizQuestion {
    id?: string
    lesson_id: string
    question: string
    options: { text: string; correct: boolean }[]
    explanation?: string
    order_index: number
}

/**
 * Get all quiz questions for a lesson.
 */
export async function getQuizzesByLesson(lessonId: string): Promise<QuizQuestion[]> {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index')

    if (error) return []
    return (data as any[]) || []
}

/**
 * Save all quiz questions for a lesson (bulk upsert).
 */
export async function saveQuizQuestions(lessonId: string, questions: Omit<QuizQuestion, 'id'>[]) {
    await ensureAdmin()
    const supabase = await createClient()

    // Delete existing quizzes for this lesson
    await (supabase as any).from('quizzes').delete().eq('lesson_id', lessonId)

    if (questions.length === 0) {
        revalidatePath('/admin/academy')
        return { success: true }
    }

    // Insert new ones
    const rows = questions.map((q, i) => ({
        lesson_id: lessonId,
        question: q.question,
        options: q.options,
        explanation: q.explanation || null,
        order_index: i
    }))

    const { error } = await (supabase as any).from('quizzes').insert(rows)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/academy')
    return { success: true }
}

// ──────────────────────────────────────────────
// STUDENT: Access check helper
// ──────────────────────────────────────────────

/**
 * Get a single course with full data for editing (admin).
 */
export async function getAdminCourse(courseId: string) {
    await ensureAdmin()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('courses')
        .select('*, modules(*, lessons(*))')
        .eq('id', courseId)
        .single()

    if (error) {
        console.error('[getAdminCourse] DB error:', error.message)
        throw new Error(error.message)
    }
    return data as any
}

/**
 * Get courses for student view with access control applied in code.
 */
export async function getStudentCourses(userLevel: 'NONE' | 'STANDARD' | 'PREMIUM') {
    const adminSupabase = createAdminClient()

    const { data, error } = await (adminSupabase as any)
        .from('courses')
        .select(`
            id, title, slug, description, thumbnail_url, visibility, access_level, price, active,
            modules (
                id, title, position,
                lessons (
                    id, title, position, visibility
                )
            )
        `)
        .eq('active', true)
        .order('created_at')

    if (error) {
        console.error('[getStudentCourses] Error:', error)
        return []
    }

    return ((data as any[]) || []).map((course: any) => ({
        ...course,
        access_level: course.access_level || course.visibility || 'STANDARD',
        thumbnail_url: course.thumbnail_url || null,
        price: null,
        is_locked: !canAccessByVisibility(userLevel, course.visibility, course.access_level),
        modules: (course.modules || []).map((mod: any) => ({
            ...mod,
            order_index: mod.position,
            lessons: (mod.lessons || []).map((lesson: any) => ({
                ...lesson,
                order_index: lesson.position,
                access_level: lesson.visibility || 'STANDARD_ONLY',
                is_locked: !canAccessByVisibility(userLevel, lesson.visibility || course.visibility, lesson.access_level || course.access_level),
                duration_minutes: 0,
            }))
        }))
    }))
}

function canAccessByVisibility(userLevel: string, visibility: string | null, accessLevel?: string | null): boolean {
    const al = accessLevel || ''
    if (al === 'PUBLIC') return true
    if (al === 'PAID') return false
    if (al === 'PREMIUM') return userLevel === 'PREMIUM'
    if (al === 'STANDARD') return ['STANDARD', 'PREMIUM'].includes(userLevel)

    const v = visibility || 'STANDARD_ONLY'
    if (v === 'BOTH') return ['STANDARD', 'PREMIUM'].includes(userLevel)
    if (v === 'STANDARD_ONLY') return ['STANDARD', 'PREMIUM'].includes(userLevel)
    if (v === 'PREMIUM_ONLY') return userLevel === 'PREMIUM'
    if (v === 'ALL' || v === 'PUBLIC') return true
    return false
}
