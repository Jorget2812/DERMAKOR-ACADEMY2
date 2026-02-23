import { getCourse, listCourses } from '@/domains/academy/actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PlayCircle, Lock, CheckCircle2 } from 'lucide-react'
import { Link } from '@/navigation'
import { Badge } from "@/components/ui/badge"

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const course = await getCourse(slug)


    if (!course) return <div className="py-20 text-center">Formation introuvable.</div>

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/app/academy" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'académie
            </Link>

            <header className="space-y-4">
                <h1 className="text-4xl font-serif">{course.title}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">{course.description}</p>
                <div className="flex items-center gap-4 text-sm pt-2">
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-none">{course.modules.length} Modules</Badge>
                    <span className="text-muted-foreground">Expertise Dermakore</span>
                </div>
            </header>

            <div className="space-y-6">
                {course.modules.map((module: any) => (
                    <Card key={module.id} className="border-border/50 overflow-hidden shadow-sm">
                        <CardHeader className="bg-secondary/20 py-4">
                            <CardTitle className="text-lg font-serif">Module {module.position}: {module.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/30">
                                {module.lessons.map((lesson: any) => (
                                    <div key={lesson.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                {lesson.position}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-medium group-hover:text-accent transition-colors">{lesson.title}</h4>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vidéo & PDF</p>
                                            </div>
                                        </div>
                                        <Link href={`/app/academy/${course.slug}/lessons/${lesson.id}`}>
                                            <Button variant="ghost" size="sm" className="gap-2 text-accent hover:text-accent hover:bg-accent/5">
                                                <PlayCircle size={14} />
                                                Commencer
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
