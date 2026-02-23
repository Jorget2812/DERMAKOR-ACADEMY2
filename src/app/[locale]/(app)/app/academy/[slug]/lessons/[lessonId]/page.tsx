import { getLesson, updateProgress, getResourceUrl, getLessonProgress } from '@/domains/academy/actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Download, FileText, Play } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { LessonInteractions } from '@/domains/academy/components/LessonInteractions'

export default async function LessonPage({ params }: { params: Promise<{ slug: string, lessonId: string }> }) {
    const { slug, lessonId } = await params
    const lesson = await getLesson(lessonId)
    const progress = await getLessonProgress(lessonId)


    if (!lesson) return <div>Leçon introuvable</div>

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <Link href={`/app/academy/${slug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> {lesson.module?.course?.title || "Retour à l'académie"}
            </Link>



            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className="bg-accent text-white border-none">Module {lesson.module?.position || "?"}</Badge>
                    <span className="text-muted-foreground text-sm">Leçon {lesson.position}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-serif leading-tight">{lesson.title}</h1>
            </div>

            {/* Video Player Section */}
            {lesson.video_url ? (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                    <iframe
                        src={lesson.video_url}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <Card className="aspect-video flex items-center justify-center bg-secondary/30 border-dashed">
                    <p className="text-muted-foreground">Pas de vidéo disponible pour esta leçon.</p>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm min-h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-xl">Description & Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                {lesson.content || "Aucune note additionnelle."}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <LessonInteractions
                        lessonId={lesson.id}
                        pdfPath={lesson.pdf_path}
                        initialCompleted={progress?.status === 'COMPLETED'}
                    />
                </div>
            </div>
        </div>
    )
}
