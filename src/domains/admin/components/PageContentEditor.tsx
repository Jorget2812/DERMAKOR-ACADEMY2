'use client'

import { useState, useTransition } from 'react'
import { upsertPageContents } from '@/domains/admin/cms-actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, CheckCircle2, AlertCircle, Loader2, Upload, ImageIcon, Settings2, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { getSignedUploadUrl } from '../academy-actions'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

export interface PageField {
    key: string
    label: string
    hint?: string
    description?: string
    type: 'text' | 'textarea' | 'image'
    placeholder?: string
}

export interface PageContentEditorProps {
    pageSlug: string
    pageName: string
    sections: {
        title: string
        description?: string
        icon?: string
        fields?: PageField[]
    }[]
    currentContent: Record<string, string>
    defaultContent: Record<string, string>
}

export function PageContentEditor({
    pageSlug,
    pageName,
    sections,
    currentContent,
    defaultContent,
}: PageContentEditorProps) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [values, setValues] = useState<Record<string, string>>(() => {
        const merged: Record<string, string> = {}
        sections.flatMap(s => s.fields || []).forEach(f => {
            merged[f.key] = currentContent[f.key] ?? ''
        })
        return merged
    })

    function handleChange(key: string, val: string) {
        setValues(prev => ({ ...prev, [key]: val }))
    }

    function handleSave() {
        setStatus('idle')
        startTransition(async () => {
            const result = await upsertPageContents(pageSlug, values)
            setStatus(result.error ? 'error' : 'success')
            setTimeout(() => setStatus('idle'), 3500)
        })
    }

    return (
        <div className="space-y-8">
            {/* Status Banner */}
            {status === 'success' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 animate-in fade-in">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-semibold">Contenu enregistré avec succès ! Les changements sont visibles sur le site.</span>
                </div>
            )}
            {status === 'error' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-in fade-in">
                    <AlertCircle size={16} />
                    <span className="text-sm font-semibold">Erreur lors de l'enregistrement. Veuillez réessayer.</span>
                </div>
            )}

            {sections.map((section, sIdx) => (
                <div key={sIdx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            {section.icon && <span className="text-xl">{section.icon}</span>}
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">{section.title}</h2>
                        </div>
                        {section.description && (
                            <p className="text-xs text-muted-foreground font-light leading-relaxed">
                                {section.description}
                            </p>
                        )}
                    </div>
                    <div className="p-8 space-y-6">
                        {section.fields?.map((field) => {
                            const placeholder = field.placeholder || defaultContent[field.key] || ''
                            return (
                                <div key={field.key} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            {field.label}
                                        </Label>
                                    </div>
                                    {field.hint && (
                                        <p className="text-xs text-gray-400 mt-0.5 mb-1 italic">
                                            → {field.hint}
                                        </p>
                                    )}
                                    {field.type === 'textarea' ? (
                                        <Textarea
                                            value={values[field.key] || ''}
                                            onChange={e => handleChange(field.key, e.target.value)}
                                            placeholder={placeholder}
                                            className="rounded-xl min-h-[100px] text-sm resize-none"
                                        />
                                    ) : field.type === 'image' ? (
                                        <UploadField
                                            label={field.label}
                                            k={field.key}
                                            val={values[field.key] || ''}
                                            onChange={handleChange}
                                            values={values}
                                            hasOverlay
                                        />
                                    ) : (
                                        <Input
                                            value={values[field.key] || ''}
                                            onChange={e => handleChange(field.key, e.target.value)}
                                            placeholder={placeholder}
                                            className="h-11 rounded-xl text-sm"
                                        />
                                    )}
                                    {field.description && (
                                        <p className="text-[10px] text-muted-foreground">{field.description}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-accent hover:bg-accent/90 text-white rounded-xl h-12 px-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20 gap-2"
                >
                    {isPending ? (
                        <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
                    ) : (
                        <><Save size={14} /> Enregistrer les modifications</>
                    )}
                </Button>
            </div>
        </div>
    )
}

function UploadField({ label, k, val, onChange, bucket = 'academy-pdfs', hasOverlay, values, hint }: any) {
    const [uploading, setUploading] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const ext = file.name.split('.').pop()
            const path = `cms/${Date.now()}.${ext}`
            const { signedUrl } = await getSignedUploadUrl(bucket as any, path)

            const res = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            })

            if (!res.ok) throw new Error('Upload échoué')

            onChange(k, path)
            toast.success("Image téléversée")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</Label>
                {hint && (
                    <p className="text-xs text-gray-400 mt-0.5 mb-1 italic">
                        → {hint}
                    </p>
                )}
                <div className="flex gap-2">
                    <Input
                        value={val || ''}
                        onChange={e => onChange(k, e.target.value)}
                        placeholder="URL ou chemin..."
                        className="h-11 rounded-xl border-slate-200 flex-grow"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                        className="h-11 w-11 p-0 rounded-xl border-slate-200 hover:border-accent hover:text-accent"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    </Button>
                    <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </div>
            </div>

            {hasOverlay && (
                <div className="ml-4 border-l-2 border-slate-100 pl-4 space-y-4">
                    <button
                        type="button"
                        onClick={() => setShowOverlay(!showOverlay)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-slate-400 hover:text-accent transition-colors"
                    >
                        <Settings2 size={14} className={showOverlay ? 'text-accent' : ''} />
                        Overlay texte (optionnel)
                        <ChevronRight size={12} className={`transition-transform ${showOverlay ? 'rotate-90' : ''}`} />
                    </button>

                    {showOverlay && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                            <Field label="Titre Overlay" k={`${k}_overlay_title`} val={values[`${k}_overlay_title`]} onChange={onChange} hint="Titre affiché par-dessus l'image" />
                            <Field label="Sous-titre Overlay" k={`${k}_overlay_subtitle`} val={values[`${k}_overlay_subtitle`]} onChange={onChange} hint="Sous-titre plus petit sous l'overlay principal" />
                            <Field label="Texte Bouton CTA" k={`${k}_overlay_cta_text`} val={values[`${k}_overlay_cta_text`]} onChange={onChange} hint="Texte du bouton sur l'image" />
                            <Field label="Lien Bouton CTA" k={`${k}_overlay_cta_link`} val={values[`${k}_overlay_cta_link`]} onChange={onChange} hint="URL de destination du bouton (ex: /pro)" />
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Position</Label>
                                <p className="text-xs text-gray-400 mt-0.5 mb-1 italic">→ Position du bloc texte sur l'image</p>
                                <select
                                    className="w-full h-12 rounded-xl border-slate-200 bg-white px-3 text-sm focus:border-accent outline-none"
                                    value={values[`${k}_overlay_position`] || 'bottom-left'}
                                    onChange={e => onChange(`${k}_overlay_position`, e.target.value)}
                                >
                                    <option value="center">Centre</option>
                                    <option value="bottom-left">Bas-Gauche</option>
                                    <option value="bottom-center">Bas-Centre</option>
                                    <option value="top-left">Haut-Gauche</option>
                                    <option value="top-right">Haut-Droite</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 self-end h-12">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Overlay Sombre</Label>
                                <Switch
                                    checked={values[`${k}_overlay_dark`] === '1'}
                                    onCheckedChange={checked => onChange(`${k}_overlay_dark`, checked ? '1' : '0')}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function Field({ label, k, val, onChange, type = 'text', placeholder, hint }: any) {
    return (
        <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</Label>
            {hint && (
                <p className="text-xs text-gray-400 mt-0.5 mb-1 italic">
                    → {hint}
                </p>
            )}
            {type === 'textarea' ? (
                <Textarea
                    value={val || ''}
                    onChange={e => onChange(k, e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[100px] rounded-xl border-slate-200 focus:border-accent"
                />
            ) : (
                <Input
                    value={val || ''}
                    onChange={e => onChange(k, e.target.value)}
                    placeholder={placeholder}
                    className="h-12 rounded-xl border-slate-200 focus:border-accent"
                />
            )}
        </div>
    )
}
