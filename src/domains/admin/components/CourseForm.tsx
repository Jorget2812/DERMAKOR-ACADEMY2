'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, GraduationCap, Image as ImageIcon } from 'lucide-react'
import { upsertCourse } from '../academy-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CourseFormProps {
    course?: any
    onClose: () => void
}

export function CourseForm({ course, onClose }: CourseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(course?.title || '')
    const [slug, setSlug] = useState(course?.slug || '')
    const [description, setDescription] = useState(course?.description || '')
    const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url || '')
    const [visibility, setVisibility] = useState(course?.visibility || 'PUBLIC')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            await upsertCourse({
                id: course?.id,
                title,
                slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                description,
                thumbnail_url: thumbnailUrl,
                visibility,
                active: true
            })
            toast.success("Cours enregistré avec succès")
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
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-accent">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-primary">{course ? 'Modifier la Formation' : 'Nouvelle Formation'}</h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Configuration du curriculum académique</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white text-slate-400">
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre du Cours</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="ex: Dermo-esthétique Avancée"
                                className="h-12 rounded-xl border-slate-200 focus:border-accent"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description Courte</Label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Objectifs et contenu de la formation..."
                                className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visibilité</Label>
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                                >
                                    <option value="PUBLIC">Publique</option>
                                    <option value="STANDARD">Standard (Partenaires)</option>
                                    <option value="PREMIUM">Premium Uniquement</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Image Couverture (URL)</Label>
                                <div className="relative">
                                    <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={thumbnailUrl}
                                        onChange={(e) => setThumbnailUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="h-12 pl-12 rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Annuler</Button>
                    <Button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="bg-accent hover:bg-accent/90 text-white rounded-xl h-12 px-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer la Formation'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
