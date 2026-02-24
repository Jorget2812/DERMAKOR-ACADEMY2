import { getCourse } from '@/domains/academy/actions'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video, FileText, BookOpen, PlayCircle, Lock, Crown } from 'lucide-react'
import { Link } from '@/navigation'

function parseMeta(content: string | null) {
    if (!content?.startsWith('__META__')) return { hasVideo: false, hasPdf: false }
    try {
        const end = content.indexOf('__ENDMETA__')
        if (end === -1) return { hasVideo: false, hasPdf: false }
        const meta = JSON.parse(content.slice(8, end))
        return { hasVideo: !!meta.video_url, hasPdf: !!meta.pdf_url }
    } catch {
        return { hasVideo: false, hasPdf: false }
    }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const course = await getCourse(slug)

    if (!course) return <div className="py-20 text-center text-muted-foreground">Formation introuvable.</div>

    const totalLessons = course.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0) || 0
    const userLevel = course.userLevel || 'NONE'

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <Link href="/app/academy" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour à l'académie
            </Link>

            {/* Course header */}
            <header className="space-y-4">
                {course.thumbnail_url && (
                    <div className="aspect-video rounded-2xl overflow-hidden shadow-md relative">
                        <img src={course.thumbnail_url} alt={course.title} className={`w-full h-full object-cover ${course.is_locked ? 'blur-sm opacity-60' : ''}`} />
                        {course.is_locked && (
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl">
                                    <Lock size={20} className="text-accent" />
                                    <span className="font-bold text-primary">
                                        {course.access_level === 'PAID' ? 'Formation payante' : 'Contenu Premium'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <h1 className="text-4xl font-serif">{course.title}</h1>
                {course.description && <p className="text-lg text-muted-foreground max-w-2xl">{course.description}</p>}
                <div className="flex items-center gap-4 text-sm pt-1">
                    <span className="flex items-center gap-1.5 font-medium text-accent">
                        <BookOpen size={14} /> {course.modules?.length || 0} modules
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <PlayCircle size={14} /> {totalLessons} leçons
                    </span>
                </div>

                {/* Upgrade banner */}
                {course.is_locked && course.access_level === 'PREMIUM' && userLevel === 'STANDARD' && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-accent/5 rounded-2xl border border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Crown size={18} className="text-purple-500" />
                            <div>
                                <p className="text-sm font-bold text-primary">Formation réservée aux membres Premium</p>
                                <p className="text-xs text-muted-foreground">Passez Premium pour accéder à tout le contenu.</p>
                            </div>
                        </div>
                        <Link href="/app/profile">
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                <Crown size={10} className="mr-1" /> Passer Premium
                            </Button>
                        </Link>
                    </div>
                )}
                {course.is_locked && course.access_level === 'PAID' && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-sm font-bold text-amber-700">Formation payante {course.price ? `— ${course.price} CHF` : ''}</p>
                        <p className="text-xs text-amber-600/70 mt-0.5">Contactez votre responsable pour activer l'accès.</p>
                    </div>
                )}
            </header>

            {/* Module + lesson listing */}
            <div className="space-y-6">
                {(course.modules || [])
                    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                    .map((module: any) => (
                        <div key={module.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100">
                                <h2 className="font-bold text-primary flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <span className="text-accent opacity-60 text-xs">Module {module.position || ''}</span>
                                    {module.title}
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {(module.lessons || [])
                                    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                                    .map((lesson: any) => {
                                        const { hasVideo, hasPdf } = parseMeta(lesson.content)
                                        const hasVideoFinal = lesson.video_url || hasVideo
                                        const hasPdfFinal = lesson.pdf_url || lesson.pdf_path || hasPdf
                                        const isLocked = lesson.is_locked

                                        return (
                                            <div key={lesson.id} className={`group flex items-center justify-between px-6 py-4 transition-colors ${isLocked ? 'opacity-60' : 'hover:bg-slate-50/50'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isLocked ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-muted-foreground'}`}>
                                                        {isLocked ? <Lock size={12} /> : lesson.position}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className={`text-sm font-medium ${isLocked ? 'text-muted-foreground/50' : 'group-hover:text-accent transition-colors'}`}>
                                                            {lesson.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            {!isLocked && hasVideoFinal && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                                                                    <Video size={8} /> Vidéo
                                                                </span>
                                                            )}
                                                            {!isLocked && hasPdfFinal && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
                                                                    <FileText size={8} /> PDF
                                                                </span>
                                                            )}
                                                            {isLocked && (
                                                                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider flex items-center gap-1">
                                                                    <Lock size={8} />
                                                                    {lesson.access_level === 'PAID' ? 'Payant' : lesson.access_level === 'PREMIUM' ? 'Premium' : 'Accès requis'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isLocked ? (
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                        <Lock size={12} className="text-slate-300" />
                                                    </div>
                                                ) : (
                                                    <Link href={`/app/academy/${course.slug}/lessons/${lesson.id}`}>
                                                        <Button variant="ghost" size="sm" className="gap-2 text-accent hover:text-accent hover:bg-accent/5 rounded-xl text-[11px] font-bold uppercase tracking-widest">
                                                            <PlayCircle size={13} /> Commencer
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}

                                {(!module.lessons || module.lessons.length === 0) && (
                                    <div className="px-6 py-6 text-center text-sm text-muted-foreground/50">
                                        Aucune leçon dans ce module.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}