'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function canAccess(userLevel: string, accessLevel: string | null): boolean {
    const al = accessLevel || 'STANDARD'
    if (al === 'PUBLIC') return true
    if (al === 'PAID') return false
    if (al === 'PREMIUM') return userLevel === 'PREMIUM'
    if (al === 'STANDARD') return ['STANDARD', 'PREMIUM'].includes(userLevel)
    return false
}

async function getUserLevel(): Promise<string> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'NONE'
    const { data } = await supabase.from('profiles').select('level').eq('id', user.id).single()
    return data?.level || 'NONE'
}

export async function listCourses() {
    const adminSupabase = createAdminClient()
    const userLevel = await getUserLevel()

    const { data, error } = await (adminSupabase as any)
        .from('courses')
        .select('*, modules(*, lessons(id, title, position, access_level, visibility))')
        .eq('active', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Academy fetch error:", error)
        return []
    }

    return (data || []).map((course: any) => ({
        ...course,
        is_locked: !canAccess(userLevel, course.access_level),
        modules: (course.modules || []).map((mod: any) => ({
            ...mod,
            lessons: (mod.lessons || []).map((lesson: any) => ({
                ...lesson,
                is_locked: !canAccess(userLevel, lesson.access_level || course.access_level)
            }))
        }))
    }))
}

export async function getCourse(slug: string) {
    const adminSupabase = createAdminClient()
    const userLevel = await getUserLevel()

    const { data, error } = await (adminSupabase as any)
        .from('courses')
        .select('*, modules(*, lessons(id, title, position, visibility, access_level, content, video_url, pdf_url, pdf_path))')
        .eq('slug', slug)
        .eq('active', true)
        .single()

    if (error) return null

    const course = data as any
    course.is_locked = !canAccess(userLevel, course.access_level)
    course.userLevel = userLevel

    if (course.modules) {
        course.modules.sort((a: any, b: any) => a.position - b.position)
        course.modules.forEach((mod: any) => {
            if (mod.lessons) {
                mod.lessons.sort((a: any, b: any) => a.position - b.position)
                mod.lessons = mod.lessons.map((lesson: any) => ({
                    ...lesson,
                    is_locked: !canAccess(userLevel, lesson.access_level || course.access_level)
                }))
            }
        })
    }

    return course
}

export async function getLesson(lessonId: string) {
    const userLevel = await getUserLevel()
    const adminSupabase = createAdminClient()

    const { data, error } = await (adminSupabase as any)
        .from('lessons')
        .select('*, module:modules(*, course:courses(title, slug, access_level))')
        .eq('id', lessonId)
        .single()

    if (error) return null

    const lesson = data as any
    const courseAccessLevel = lesson.module?.course?.access_level || 'STANDARD'
    const lessonAccessLevel = lesson.access_level || courseAccessLevel

    // Verificar acceso
    if (!canAccess(userLevel, lessonAccessLevel)) {
        return { ...lesson, is_locked: true, content: null, video_url: null, pdf_url: null, pdf_path: null }
    }

    return { ...lesson, is_locked: false }
}

export async function updateProgress(lessonId: string, completed: boolean, position: number = 0) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            status: (completed ? 'COMPLETED' : 'STARTED'),
            last_position_sec: position,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        })

    if (error) console.error("Progress update error:", error)
    revalidatePath('/app/academy')
}

export async function getResourceUrl(path: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Accès refusé")

    const { data, error } = await supabase.storage
        .from('academy_resources')
        .createSignedUrl(path, 60)

    if (error) throw new Error("Erreur de lien")
    return data.signedUrl
}

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