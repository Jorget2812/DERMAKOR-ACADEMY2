import { listCourses } from '@/domains/academy/actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, PlayCircle, BookOpen } from 'lucide-react'
import { Link } from '@/navigation'

interface Course {
    id: string
    slug: string
    title: string
    description: string | null
    modules: any[]
}

export default async function AcademyPage() {
    const courses = (await listCourses()) as Course[]

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-serif">Votre Académie</h1>
                <p className="text-muted-foreground mt-1">Formations en dermo-esthétique et protocoles professionnels.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1 border-border/50">
                        <div className="aspect-video bg-primary flex items-center justify-center text-white/10 overflow-hidden relative">
                            <GraduationCap size={80} strokeWidth={1} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <div className="flex items-center gap-2"><PlayCircle size={14} className="text-accent" /> {course.modules.length} Modules</div>
                                <div className="flex items-center gap-2"><BookOpen size={14} className="text-accent" /> PDF inclus</div>
                            </div>
                            <Link href={`/app/academy/${course.slug}`}>
                                <Button variant="outline" className="w-full mt-4 group">
                                    Commencer la formation
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
