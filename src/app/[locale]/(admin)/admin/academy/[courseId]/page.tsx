import { getAdminCourse } from '@/domains/admin/academy-actions'
import { AdminCourseEditor } from '@/domains/admin/components/AdminCourseEditor'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ courseId: string }>
}

export default async function AdminCourseDetailPage({ params }: Props) {
    const { courseId } = await params

    let course: any = null
    try {
        course = await getAdminCourse(courseId)
    } catch (err) {
        console.error('[AdminCourseDetailPage] Error fetching course:', err)
    }

    if (!course) notFound()

    return <AdminCourseEditor course={course} />
}
