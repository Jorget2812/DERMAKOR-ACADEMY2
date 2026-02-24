import { getLesson, getLessonProgress } from '@/domains/academy/actions'
import { ArrowLeft, FileText, Video, ExternalLink, BookOpen, Lock, Crown } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LessonInteractions } from '@/domains/academy/components/LessonInteractions'

function parseLessonMeta(content: string | null) {
    if (!content) return { videoUrl: null, pdfUrl: null, duration: 0, text: '' }
    if (content.startsWith('__META__')) {
        const end = content.indexOf('__ENDMETA__')
        if (end !== -1) {
            try {
                const meta = JSON.parse(content.slice(8, end))
                const text = content.slice(end + 11).replace(/^\n/, '').trim()
                return { videoUrl: meta.video_url || null, pdfUrl: meta.pdf_url || null, duration: meta.duration_minutes || 0, text }
            } catch { }
        }
    }
    return { videoUrl: null, pdfUrl: null, duration: 0, text: content }
}

function toEmbedUrl(url: string): string {
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    if (url.includes('1drv.ms') || url.includes('sharepoint.com'))
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    return url
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
    const { slug, lessonId } = await params
    const lesson = await getLesson(lessonId)
    const progress = await getLessonProgress(lessonId)

    if (!lesson) return (
        <div className="py-20 text-center text-muted-foreground">
            <Lock size={32} className="mx-auto mb-4 text-slate-200" strokeWidth={1} />
            <p>Leçon introuvable.</p>
        </div>
    )

    if (lesson.is_locked) {
        const isPaid = lesson.access_level === 'PAID' || lesson.module?.course?.access_level === 'PAID'
        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <Link href={`/app/academy/${slug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-2">
                    <ArrowLeft className="w-4 h-4" /> Retour au cours
                </Link>
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                        <Lock size={32} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-serif text-primary">{lesson.title}</h2>
                        <p className="text-muted-foreground">
                            {isPaid ? "Cette leçon fait partie d'une formation payante." : "Cette leçon est réservée aux membres Premium."}
                        </p>
                    </div>
                    {!isPaid && (
                        <Link href="/app/profile">
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] gap-2">
                                <Crown size={12} /> Passer Premium pour débloquer
                            </Button>
                        </Link>
                    )}
                    {isPaid && (
                        <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                            Contactez votre responsable pour activer l'accès.
                        </p>
                    )}
                    <Link href={`/app/academy/${slug}`} className="text-sm text-muted-foreground hover:text-primary underline">
                        Voir les autres leçons du cours
                    </Link>
                </div>
            </div>
        )
    }

    const { videoUrl: metaVideo, pdfUrl: metaPdf, text } = parseLessonMeta(lesson.content)
    const videoUrl = lesson.video_url || metaVideo
    const pdfUrl = lesson.pdf_url || lesson.pdf_path || metaPdf

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <Link href={`/app/academy/${slug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-2">
                <ArrowLeft className="w-4 h-4" />
                {lesson.module?.course?.title || "Retour à l'académie"}
            </Link>

            <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-accent text-white border-none">Module {lesson.module?.position || '?'}</Badge>
                    <span className="text-muted-foreground text-sm">Leçon {lesson.position}</span>
                    {videoUrl && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            <Video size={10} /> Vidéo
                        </span>
                    )}
                    {pdfUrl && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                            <FileText size={10} /> PDF
                        </span>
                    )}
                </div>
                <h1 className="text-3xl md:text-4xl font-serif leading-tight">{lesson.title}</h1>
            </div>

            {videoUrl ? (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <iframe src={toEmbedUrl(videoUrl)} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                </div>
            ) : (
                <div className="aspect-video flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="text-center space-y-2">
                        <Video size={36} className="mx-auto text-slate-200" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground/60">Pas de vidéo pour cette leçon.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {pdfUrl && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-2 font-semibold text-primary">
                                    <FileText size={16} className="text-amber-500" /> Support de cours — PDF
                                </h2>
                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent hover:underline">
                                    <ExternalLink size={11} /> Ouvrir dans un onglet
                                </a>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-amber-100 shadow-sm bg-white">
                                <iframe src={toEmbedUrl(pdfUrl)} className="w-full" style={{ height: '600px' }} title={`PDF - ${lesson.title}`} />
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                            <BookOpen size={16} className="text-accent" />
                            <h2 className="font-semibold text-primary">Description & Notes</h2>
                        </div>
                        <div className="px-6 py-5 prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                            {text || 'Aucune note additionnelle pour cette leçon.'}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <LessonInteractions lessonId={lesson.id} pdfPath={pdfUrl || undefined} initialCompleted={progress?.status === 'COMPLETED'} />
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contenu de la leçon</h3>
                        <div className="space-y-2">
                            <div className={`flex items-center gap-3 p-3 rounded-xl text-sm ${videoUrl ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                                <Video size={14} />
                                <span className="font-medium">{videoUrl ? 'Vidéo disponible' : 'Pas de vidéo'}</span>
                            </div>
                            <div className={`flex items-center gap-3 p-3 rounded-xl text-sm ${pdfUrl ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
                                <FileText size={14} />
                                <span className="font-medium">{pdfUrl ? 'Document PDF' : 'Pas de document'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}