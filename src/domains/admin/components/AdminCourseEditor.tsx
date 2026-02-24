'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft, Plus, GraduationCap, Layers, BookOpen,
    Trash2, Video, FileText, Lock, Save,
    Loader2, CheckCircle2, Upload, Clock, HelpCircle
} from 'lucide-react'
import { Link } from '@/navigation'
import {
    upsertModule, deleteModule, upsertLesson, deleteLesson,
    saveQuizQuestions, getSignedUploadUrl
} from '../academy-actions'
import { QuizBuilder } from './QuizBuilder'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AdminCourseEditorProps {
    course: any
}

const LESSON_ACCESS_LEVELS = [
    { value: 'INHERIT', label: 'Hériter', color: 'text-slate-500' },
    { value: 'PUBLIC', label: 'Public', color: 'text-green-600' },
    { value: 'STANDARD', label: 'Standard', color: 'text-blue-600' },
    { value: 'PREMIUM', label: 'Premium', color: 'text-purple-600' },
]

const VISIBILITY_BADGE: Record<string, string> = {
    PUBLIC: 'bg-green-100 text-green-700',
    ALL: 'bg-green-100 text-green-700',
    STANDARD: 'bg-blue-100 text-blue-700',
    STANDARD_ONLY: 'bg-blue-100 text-blue-700',
    PREMIUM: 'bg-purple-100 text-purple-700',
    PREMIUM_ONLY: 'bg-purple-100 text-purple-700',
    PAID: 'bg-amber-100 text-amber-700',
}

/** Parse __META__ prefix embedded in lesson content field */
function parseLessonContent(content: string | null) {
    if (!content) return { videoUrl: '', pdfUrl: '', duration: 0, text: '' }
    if (content.startsWith('__META__')) {
        const end = content.indexOf('__ENDMETA__')
        if (end !== -1) {
            try {
                const meta = JSON.parse(content.slice(8, end))
                const text = content.slice(end + 11).replace(/^\n/, '')
                return { videoUrl: meta.video_url || '', pdfUrl: meta.pdf_url || '', duration: meta.duration_minutes || 0, text }
            } catch { /* fall through */ }
        }
    }
    return { videoUrl: '', pdfUrl: '', duration: 0, text: content }
}

export function AdminCourseEditor({ course }: AdminCourseEditorProps) {
    const router = useRouter()
    const [selectedLesson, setSelectedLesson] = useState<any>(null)
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
    const [tab, setTab] = useState<'content' | 'quiz'>('content')

    // Module form state
    const [showModuleForm, setShowModuleForm] = useState(false)
    const [newModuleTitle, setNewModuleTitle] = useState('')
    const [addingModule, setAddingModule] = useState(false)

    // Lesson form state (inline, right panel)
    const [saving, setSaving] = useState(false)
    const [lessonTitle, setLessonTitle] = useState('')
    const [lessonText, setLessonText] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [pdfUrl, setPdfUrl] = useState('')
    const [duration, setDuration] = useState(0)
    const [accessLevel, setAccessLevel] = useState('INHERIT')
    const [position, setPosition] = useState(0)

    // Upload state
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [uploadingPdf, setUploadingPdf] = useState(false)
    const videoRef = useRef<HTMLInputElement>(null)
    const pdfRef = useRef<HTMLInputElement>(null)

    function loadLesson(lesson: any, moduleId: string) {
        const parsed = parseLessonContent(lesson.content)
        setSelectedLesson(lesson)
        setSelectedModuleId(moduleId)
        setLessonTitle(lesson.title || '')
        setLessonText(parsed.text)
        setVideoUrl(lesson.video_url || parsed.videoUrl)
        setPdfUrl(lesson.pdf_url || parsed.pdfUrl)
        setDuration(lesson.duration_minutes || parsed.duration)
        setAccessLevel(lesson.access_level || 'INHERIT')
        setPosition(lesson.position ?? lesson.order_index ?? 0)
        setTab('content')
    }

    async function handleNewLesson(moduleId: string, currentCount: number) {
        // Create a blank lesson then load it for editing
        setSaving(true)
        try {
            const { data } = await upsertLesson({
                module_id: moduleId,
                title: 'Nouvelle Leçon',
                order_index: currentCount,
            })
            toast.success('Leçon créée — modifiez-la ci-dessous')
            router.refresh()
            // Load it immediately in the editor
            setSelectedLesson(data)
            setSelectedModuleId(moduleId)
            setLessonTitle('Nouvelle Leçon')
            setLessonText('')
            setVideoUrl('')
            setPdfUrl('')
            setDuration(0)
            setAccessLevel('INHERIT')
            setPosition(currentCount)
            setTab('content')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleSaveLesson() {
        if (!selectedLesson || !selectedModuleId) return
        setSaving(true)
        try {
            await upsertLesson({
                id: selectedLesson.id,
                module_id: selectedModuleId,
                title: lessonTitle,
                content: lessonText,
                video_url: videoUrl || null,
                pdf_url: pdfUrl || null,
                duration_minutes: duration,
                order_index: position,
                access_level: accessLevel as any,
            })
            toast.success('Leçon sauvegardée ✓')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleDeleteLesson(lessonId: string) {
        if (!confirm('Supprimer cette leçon ?')) return
        await deleteLesson(lessonId)
        toast.success('Leçon supprimée')
        if (selectedLesson?.id === lessonId) setSelectedLesson(null)
        router.refresh()
    }

    async function handleDeleteModule(moduleId: string) {
        if (!confirm('Supprimer ce module et toutes ses leçons ?')) return
        await deleteModule(moduleId)
        toast.success('Module supprimé')
        router.refresh()
    }

    async function handleAddModule(e: React.FormEvent) {
        e.preventDefault()
        if (!newModuleTitle.trim()) return
        setAddingModule(true)
        try {
            await upsertModule({ course_id: course.id, title: newModuleTitle, order_index: course.modules?.length || 0 })
            toast.success('Module créé ✓')
            setNewModuleTitle('')
            setShowModuleForm(false)
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setAddingModule(false)
        }
    }

    async function handleVideoUpload(file: File) {
        setUploadingVideo(true)
        try {
            const ext = file.name.split('.').pop()
            const path = `lessons/${selectedModuleId}/${Date.now()}.${ext}`
            const { signedUrl } = await getSignedUploadUrl('academy-videos', path)
            const res = await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
            if (!res.ok) throw new Error('Upload échoué')
            setVideoUrl(path)
            toast.success('Vidéo uploadée ✓')
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setUploadingVideo(false)
        }
    }

    async function handlePdfUpload(file: File) {
        setUploadingPdf(true)
        try {
            const path = `lessons/${selectedModuleId}/${Date.now()}_${file.name}`
            const { signedUrl } = await getSignedUploadUrl('academy-pdfs', path)
            const res = await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': 'application/pdf' } })
            if (!res.ok) throw new Error('Upload échoué')
            setPdfUrl(path)
            toast.success('PDF uploadé ✓')
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setUploadingPdf(false)
        }
    }

    const accessBadge = VISIBILITY_BADGE[course.access_level || course.visibility] || VISIBILITY_BADGE.STANDARD

    return (
        <div className="flex h-[calc(100vh-5rem)] overflow-hidden animate-in fade-in duration-500">
            {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col overflow-hidden flex-shrink-0">
                <div className="p-5 border-b border-slate-100 space-y-3">
                    <Link href="/admin/academy">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary -ml-2 text-[10px]">
                            <ArrowLeft size={12} /> Formations
                        </Button>
                    </Link>
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                            <GraduationCap size={18} />
                        </div>
                        <div className="flex-grow min-w-0">
                            <h2 className="font-bold text-primary text-sm leading-tight line-clamp-2">{course.title}</h2>
                            <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${accessBadge}`}>
                                {course.visibility || course.access_level || 'STANDARD'}
                            </span>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setShowModuleForm(true)} className="w-full bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-[10px] font-bold uppercase tracking-widest border-none h-9">
                        <Plus size={12} className="mr-1" /> Nouveau Module
                    </Button>
                </div>

                <div className="flex-grow overflow-y-auto p-3 space-y-3">
                    {(course.modules || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0)).map((mod: any) => {
                        const lessonCount = mod.lessons?.length || 0
                        return (
                            <div key={mod.id}>
                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 group">
                                    <Layers size={12} className="text-accent flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-primary flex-grow line-clamp-1 uppercase tracking-wide">{mod.title}</span>
                                    <button onClick={() => handleDeleteModule(mod.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                                <div className="ml-3 mt-1 space-y-0.5">
                                    {(mod.lessons || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0)).map((lesson: any) => {
                                        const isSelected = selectedLesson?.id === lesson.id
                                        const parsed = parseLessonContent(lesson.content)
                                        const hasVideo = lesson.video_url || parsed.videoUrl
                                        const hasPdf = lesson.pdf_url || parsed.pdfUrl
                                        return (
                                            <div
                                                key={lesson.id}
                                                onClick={() => loadLesson(lesson, mod.id)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group/lesson transition-all ${isSelected ? 'bg-accent text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                                            >
                                                <BookOpen size={11} className={isSelected ? 'text-white/70' : 'text-muted-foreground'} />
                                                <span className="text-[11px] flex-grow line-clamp-1">{lesson.title}</span>
                                                <div className="flex items-center gap-1">
                                                    {hasVideo && <Video size={9} className={isSelected ? 'text-white/70' : 'text-blue-400'} />}
                                                    {hasPdf && <FileText size={9} className={isSelected ? 'text-white/70' : 'text-amber-400'} />}
                                                    <button onClick={e => { e.stopPropagation(); handleDeleteLesson(lesson.id) }} className={`opacity-0 group-hover/lesson:opacity-100 ${isSelected ? 'text-white/60 hover:text-white' : 'text-slate-300 hover:text-red-500'}`}>
                                                        <Trash2 size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <button
                                        onClick={() => handleNewLesson(mod.id, lessonCount)}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-200 text-muted-foreground hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all w-full text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />} Ajouter une Leçon
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    {!course.modules?.length && (
                        <div className="py-12 text-center">
                            <Layers size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs text-muted-foreground">Cliquez sur <strong>+ Nouveau Module</strong></p>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── RIGHT PANEL ──────────────────────────────────── */}
            <main className="flex-grow overflow-y-auto bg-slate-50/30">
                {selectedLesson ? (
                    <div className="max-w-2xl mx-auto p-8 space-y-6">
                        {/* Header + Save */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Édition de la leçon</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTab('content')}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${tab === 'content' ? 'bg-accent text-white' : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'}`}
                                >
                                    Contenu
                                </button>
                                <button
                                    onClick={() => setTab('quiz')}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all ${tab === 'quiz' ? 'bg-accent text-white' : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'}`}
                                >
                                    <HelpCircle size={10} /> Quiz
                                </button>
                            </div>
                        </div>

                        {tab === 'content' && (
                            <div className="space-y-5">
                                {/* Title */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre de la Leçon *</label>
                                    <div className="flex gap-3">
                                        <Input
                                            value={lessonTitle}
                                            onChange={e => setLessonTitle(e.target.value)}
                                            placeholder="Titre..."
                                            className="h-11 rounded-xl border-slate-200 flex-grow"
                                        />
                                        <Input
                                            type="number"
                                            min="0"
                                            value={position}
                                            onChange={e => setPosition(parseInt(e.target.value) || 0)}
                                            className="h-11 w-20 rounded-xl border-slate-200 text-center"
                                            title="Ordre"
                                        />
                                    </div>
                                </div>

                                {/* 🎬 VIDEO */}
                                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                        <Video size={12} /> Vidéo de la leçon
                                    </label>
                                    {videoUrl ? (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                                            <span className="text-xs text-slate-600 flex-grow truncate font-mono">{videoUrl}</span>
                                            <button type="button" onClick={() => setVideoUrl('')} className="text-slate-400 hover:text-red-500 text-xs font-bold">✕</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => videoRef.current?.click()}
                                                disabled={uploadingVideo}
                                                className="w-full p-5 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center cursor-pointer disabled:opacity-50"
                                            >
                                                {uploadingVideo ? (
                                                    <div className="flex items-center justify-center gap-2 text-blue-500">
                                                        <Loader2 size={16} className="animate-spin" />
                                                        <span className="text-xs">Upload en cours...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={20} className="mx-auto mb-2 text-blue-200" />
                                                        <p className="text-xs text-slate-500">Cliquer pour uploader une vidéo (MP4, max 500MB)</p>
                                                    </>
                                                )}
                                            </button>
                                            <input ref={videoRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f) }} />
                                            <div className="flex items-center gap-2">
                                                <div className="flex-grow h-px bg-slate-100" /><span className="text-[9px] text-slate-300 uppercase">ou URL directe</span><div className="flex-grow h-px bg-slate-100" />
                                            </div>
                                            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/embed/... ou lien direct MP4" className="h-10 rounded-xl border-slate-200 text-xs" />
                                        </>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-slate-400" />
                                        <Input type="number" min="0" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)} className="h-8 w-20 rounded-lg border-slate-200 text-xs text-center" />
                                        <span className="text-[10px] text-muted-foreground">minutes</span>
                                    </div>
                                </div>

                                {/* 📄 PDF */}
                                <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                        <FileText size={12} /> Document PDF / Support de cours
                                    </label>
                                    {pdfUrl ? (
                                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                                            <span className="text-xs text-slate-600 flex-grow truncate font-mono">{pdfUrl}</span>
                                            <button type="button" onClick={() => setPdfUrl('')} className="text-slate-400 hover:text-red-500 text-xs font-bold">✕</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => pdfRef.current?.click()}
                                                disabled={uploadingPdf}
                                                className="w-full p-5 rounded-xl border-2 border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-center cursor-pointer disabled:opacity-50"
                                            >
                                                {uploadingPdf ? (
                                                    <div className="flex items-center justify-center gap-2 text-amber-500">
                                                        <Loader2 size={16} className="animate-spin" />
                                                        <span className="text-xs">Upload en cours...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={20} className="mx-auto mb-2 text-amber-200" />
                                                        <p className="text-xs text-slate-500">Cliquer pour uploader un PDF (max 50MB)</p>
                                                    </>
                                                )}
                                            </button>
                                            <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f) }} />
                                            <div className="flex items-center gap-2">
                                                <div className="flex-grow h-px bg-slate-100" /><span className="text-[9px] text-slate-300 uppercase">ou URL directe</span><div className="flex-grow h-px bg-slate-100" />
                                            </div>
                                            <Input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://... lien vers le PDF" className="h-10 rounded-xl border-slate-200 text-xs" />
                                        </>
                                    )}
                                </div>

                                {/* 📝 Notes */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notes de cours / Description</label>
                                    <textarea
                                        value={lessonText}
                                        onChange={e => setLessonText(e.target.value)}
                                        placeholder="Résumé, points clés, rappels pour les apprenants..."
                                        className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 resize-none"
                                    />
                                </div>

                                {/* 🔒 Access Level */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Lock size={10} /> Niveau d'accès
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {LESSON_ACCESS_LEVELS.map(level => (
                                            <button
                                                key={level.value}
                                                type="button"
                                                onClick={() => setAccessLevel(level.value)}
                                                className={`p-3 rounded-xl border text-left transition-all ${accessLevel === level.value ? 'border-accent bg-accent/5' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <div className={`text-[10px] font-bold uppercase tracking-wider ${accessLevel === level.value ? 'text-accent' : level.color}`}>{level.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <Button
                                    onClick={handleSaveLesson}
                                    disabled={saving || !lessonTitle}
                                    className="w-full h-12 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-accent/20"
                                >
                                    {saving ? <><Loader2 size={14} className="animate-spin mr-2" /> Sauvegarde...</> : <><Save size={14} className="mr-2" /> Sauvegarder la Leçon</>}
                                </Button>
                            </div>
                        )}

                        {tab === 'quiz' && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <QuizBuilder
                                    lessonId={selectedLesson.id}
                                    initialQuestions={selectedLesson.quizzes || []}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4 max-w-xs">
                            <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                                <BookOpen size={32} className="text-accent" strokeWidth={1.5} />
                            </div>
                            <p className="text-muted-foreground text-sm font-light">Cliquez sur une leçon dans le panneau gauche pour l'éditer, ou sur <strong>+ Ajouter une Leçon</strong> pour en créer une.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Module creation modal */}
            {showModuleForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-serif text-primary">Nouveau Module</h2>
                        <form onSubmit={handleAddModule} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Titre du Module</label>
                                <input
                                    autoFocus
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    placeholder="ex: Module 1 — Introduction"
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:border-accent"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button type="button" variant="ghost" onClick={() => setShowModuleForm(false)} className="rounded-xl h-10 px-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Annuler</Button>
                                <Button type="submit" disabled={addingModule} className="bg-accent text-white rounded-xl h-10 px-8 text-[10px] font-bold uppercase tracking-widest">
                                    {addingModule ? 'Création...' : 'Créer'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
