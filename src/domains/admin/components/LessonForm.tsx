'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Video, FileText, Clock, Lock, Upload, CheckCircle2, Loader2 } from 'lucide-react'
import { upsertLesson, getSignedUploadUrl, type LessonAccessLevel } from '../academy-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LessonFormProps {
    lesson?: any
    moduleId: string
    courseAccessLevel?: string
    onClose: () => void
}

const LESSON_ACCESS_LEVELS: { value: LessonAccessLevel; label: string; desc: string }[] = [
    { value: 'INHERIT', label: 'Hériter du cours', desc: 'Utilise le niveau d\'accès du cours parent' },
    { value: 'PUBLIC', label: 'Public', desc: 'Accessible à tous (prévisualisation)' },
    { value: 'STANDARD', label: 'Standard', desc: 'Partenaires Standard & Premium' },
    { value: 'PREMIUM', label: 'Premium', desc: 'Premium uniquement' },
    { value: 'PAID', label: 'Payant', desc: 'Débloqué individuellement' },
]

export function LessonForm({ lesson, moduleId, courseAccessLevel, onClose }: LessonFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(lesson?.title || '')
    const [content, setContent] = useState(lesson?.content || '')
    const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '')
    const [pdfUrl, setPdfUrl] = useState(lesson?.pdf_url || '')
    const [duration, setDuration] = useState(lesson?.duration_minutes?.toString() || '0')
    const [accessLevel, setAccessLevel] = useState<LessonAccessLevel>(lesson?.access_level || 'INHERIT')
    const [orderIndex, setOrderIndex] = useState(lesson?.order_index?.toString() || '0')

    // Upload state
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [uploadingPdf, setUploadingPdf] = useState(false)
    const [videoProgress, setVideoProgress] = useState('')
    const videoRef = useRef<HTMLInputElement>(null)
    const pdfRef = useRef<HTMLInputElement>(null)

    async function handleVideoUpload(file: File) {
        setUploadingVideo(true)
        setVideoProgress('Préparation du téléversement...')
        try {
            const ext = file.name.split('.').pop()
            const path = `lessons/${moduleId}/${Date.now()}.${ext}`
            const { signedUrl, token } = await getSignedUploadUrl('academy-videos', path)

            setVideoProgress('Téléversement en cours...')
            const res = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            })

            if (!res.ok) throw new Error('Upload échoué')
            const publicPath = `${path}`
            setVideoUrl(publicPath)
            setVideoProgress('✓ Vidéo téléversée avec succès')
            toast.success('Vidéo uploadée avec succès')
        } catch (err: any) {
            toast.error(`Erreur upload: ${err.message}`)
            setVideoProgress('')
        } finally {
            setUploadingVideo(false)
        }
    }

    async function handlePdfUpload(file: File) {
        setUploadingPdf(true)
        try {
            const path = `lessons/${moduleId}/${Date.now()}_${file.name}`
            const { signedUrl } = await getSignedUploadUrl('academy-pdfs', path)

            const res = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': 'application/pdf' }
            })

            if (!res.ok) throw new Error('Upload échoué')
            setPdfUrl(path)
            toast.success('PDF uploadé avec succès')
        } catch (err: any) {
            toast.error(`Erreur upload: ${err.message}`)
        } finally {
            setUploadingPdf(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            await upsertLesson({
                id: lesson?.id,
                module_id: moduleId,
                title,
                content,
                video_url: videoUrl || null,
                pdf_url: pdfUrl || null,
                duration_minutes: parseInt(duration) || 0,
                order_index: parseInt(orderIndex) || 0,
                access_level: accessLevel
            })
            toast.success('Leçon enregistrée ✓')
            router.refresh()
            onClose()
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-serif text-primary">{lesson ? 'Modifier la Leçon' : 'Nouvelle Leçon'}</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Contenu & Accès</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-400"><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-8 space-y-6">
                    {/* Title + Order */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre de la Leçon *</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Introduction aux acides" className="h-12 rounded-xl border-slate-200" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ordre</Label>
                            <Input type="number" min="0" value={orderIndex} onChange={e => setOrderIndex(e.target.value)} className="h-12 rounded-xl border-slate-200 text-center" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contenu / Notes de cours</Label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Texte introductif, notes, résumé de la leçon..."
                            className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
                        />
                    </div>

                    {/* Video Upload */}
                    <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                            <Video size={12} /> Vidéo de la leçon
                        </Label>
                        {videoUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className="text-xs text-slate-600 flex-grow truncate font-mono">{videoUrl}</span>
                                <button type="button" onClick={() => setVideoUrl('')} className="text-slate-400 hover:text-red-500 text-xs">Supprimer</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => videoRef.current?.click()}
                                    disabled={uploadingVideo}
                                    className="w-full p-6 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group/upload cursor-pointer disabled:opacity-50"
                                >
                                    {uploadingVideo ? (
                                        <div className="flex items-center justify-center gap-2 text-blue-500">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-xs">{videoProgress}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={20} className="mx-auto mb-2 text-blue-300 group-hover/upload:text-blue-500 transition-colors" />
                                            <p className="text-xs text-slate-500">Cliquer pour uploader une vidéo <span className="text-muted-foreground">(MP4, WebM — max 500MB)</span></p>
                                        </>
                                    )}
                                </button>
                                <input ref={videoRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f) }} />
                                <div className="flex items-center gap-2">
                                    <div className="flex-grow h-px bg-slate-100" />
                                    <span className="text-[9px] text-slate-300 uppercase">ou entrer une URL</span>
                                    <div className="flex-grow h-px bg-slate-100" />
                                </div>
                                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://... ou chemin Supabase" className="h-10 rounded-xl border-slate-200 text-xs" />
                            </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            <Clock size={12} className="text-slate-400" />
                            <Input type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)} className="h-8 w-24 rounded-lg border-slate-200 text-xs" />
                            <span className="text-[10px] text-muted-foreground">minutes</span>
                        </div>
                    </div>

                    {/* PDF Upload */}
                    <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                            <FileText size={12} /> Document PDF / Support de cours
                        </Label>
                        {pdfUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-100">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className="text-xs text-slate-600 flex-grow truncate font-mono">{pdfUrl}</span>
                                <button type="button" onClick={() => setPdfUrl('')} className="text-slate-400 hover:text-red-500 text-xs">Supprimer</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => pdfRef.current?.click()}
                                    disabled={uploadingPdf}
                                    className="w-full p-6 rounded-xl border-2 border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-center cursor-pointer group/upload disabled:opacity-50"
                                >
                                    {uploadingPdf ? (
                                        <div className="flex items-center justify-center gap-2 text-amber-500">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-xs">Téléversement...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={20} className="mx-auto mb-2 text-amber-300 group-hover/upload:text-amber-500 transition-colors" />
                                            <p className="text-xs text-slate-500">Cliquer pour uploader un PDF <span className="text-muted-foreground">(max 50MB)</span></p>
                                        </>
                                    )}
                                </button>
                                <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f) }} />
                                <div className="flex items-center gap-2">
                                    <div className="flex-grow h-px bg-slate-100" />
                                    <span className="text-[9px] text-slate-300 uppercase">ou entrer une URL</span>
                                    <div className="flex-grow h-px bg-slate-100" />
                                </div>
                                <Input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://... ou chemin Supabase" className="h-10 rounded-xl border-slate-200 text-xs" />
                            </div>
                        )}
                    </div>

                    {/* Access Level */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Lock size={10} /> Niveau d'accès de cette leçon
                        </Label>
                        {courseAccessLevel && (
                            <p className="text-[10px] text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg">
                                Cours parent: <strong>{courseAccessLevel}</strong> — "Hériter" utilisera ce niveau.
                            </p>
                        )}
                        <div className="grid grid-cols-1 gap-2">
                            {LESSON_ACCESS_LEVELS.map(level => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setAccessLevel(level.value)}
                                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${accessLevel === level.value ? 'border-accent bg-accent/5' : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${accessLevel === level.value ? 'border-accent bg-accent' : 'border-slate-300'}`} />
                                    <div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${accessLevel === level.value ? 'text-accent' : 'text-primary'}`}>{level.label}</div>
                                        <div className="text-[10px] text-muted-foreground">{level.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl h-10 px-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Annuler</Button>
                    <Button disabled={loading || !title} onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-white rounded-xl h-10 px-8 font-bold uppercase tracking-widest text-[10px]">
                        {loading ? 'Enregistrement...' : 'Sauvegarder la Leçon'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
