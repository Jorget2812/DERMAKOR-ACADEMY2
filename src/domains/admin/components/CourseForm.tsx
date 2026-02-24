'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, GraduationCap, Image as ImageIcon, Lock, DollarSign } from 'lucide-react'
import { upsertCourse, type CourseAccessLevel } from '../academy-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CourseFormProps {
    course?: any
    onClose: () => void
}

const ACCESS_LEVELS: { value: CourseAccessLevel; label: string; desc: string; color: string }[] = [
    { value: 'PUBLIC', label: 'Public', desc: 'Visible par tous, sans connexion', color: 'text-green-600' },
    { value: 'STANDARD', label: 'Standard', desc: 'Partenaires vérifiés Standard & Premium', color: 'text-blue-600' },
    { value: 'PREMIUM', label: 'Premium', desc: 'Partenaires Premium uniquement', color: 'text-purple-600' },
    { value: 'PAID', label: 'Formation payante', desc: 'Achat individuel requis', color: 'text-accent' },
]

export function CourseForm({ course, onClose }: CourseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(course?.title || '')
    const [slug, setSlug] = useState(course?.slug || '')
    const [description, setDescription] = useState(course?.description || '')
    const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url || '')
    const [accessLevel, setAccessLevel] = useState<CourseAccessLevel>(course?.access_level || 'STANDARD')
    const [price, setPrice] = useState<string>(course?.price?.toString() || '')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            await upsertCourse({
                id: course?.id,
                title,
                slug: slug || '',
                description,
                thumbnail_url: thumbnailUrl,
                access_level: accessLevel,
                price: accessLevel === 'PAID' ? parseFloat(price) || null : null,
                active: true
            })
            toast.success("Formation enregistrée avec succès ✓")
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
                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre du Cours *</Label>
                        <Input
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); if (!course) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')) }}
                            placeholder="ex: Dermo-esthétique Avancée"
                            className="h-12 rounded-xl border-slate-200 focus:border-accent"
                            required
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slug URL</Label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="dermo-esthetique-avancee"
                            className="h-10 rounded-xl border-slate-200 font-mono text-sm text-slate-500"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</Label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Objectifs et contenu de la formation..."
                            className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent"
                        />
                    </div>

                    {/* Access Level */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <Lock size={10} className="inline mr-1" /> Niveau d'accès
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            {ACCESS_LEVELS.map(level => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setAccessLevel(level.value)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${accessLevel === level.value
                                        ? 'border-accent bg-accent/5'
                                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                                        }`}
                                >
                                    <div className={`text-[11px] font-bold uppercase tracking-wider ${accessLevel === level.value ? 'text-accent' : level.color}`}>
                                        {level.label}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-1">{level.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price (only for PAID) */}
                    {accessLevel === 'PAID' && (
                        <div className="space-y-2 p-4 bg-accent/5 rounded-xl border border-accent/10">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">
                                <DollarSign size={10} className="inline mr-1" /> Prix de la formation (CHF)
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="99.00"
                                className="h-12 rounded-xl border-accent/20 focus:border-accent"
                            />
                            <p className="text-[10px] text-muted-foreground">Le déblocage manuel se fait depuis le profil utilisateur dans l'admin.</p>
                        </div>
                    )}

                    {/* Thumbnail URL */}
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
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Annuler</Button>
                    <Button
                        disabled={loading || !title}
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
