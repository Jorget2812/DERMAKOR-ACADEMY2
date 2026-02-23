import { getAdminCourses } from '@/domains/admin/academy-actions'
import { AcademyContainer } from '@/domains/admin/components/AcademyContainer'

export default async function AdminAcademyPage() {
    const courses = await getAdminCourses()

    return <AcademyContainer initialCourses={courses} />
}
