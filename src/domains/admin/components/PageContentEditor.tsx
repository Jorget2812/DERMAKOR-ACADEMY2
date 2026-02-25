'use client'

import { useState, useTransition } from 'react'
import { upsertPageContents } from '@/domains/admin/cms-actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export interface PageField {
    key: string
    label: string
    description?: string
    type: 'text' | 'textarea'
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
                                        {values[field.key] && (
                                            <button
                                                type="button"
                                                onClick={() => handleChange(field.key, '')}
                                                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                Réinitialiser
                                            </button>
                                        )}
                                    </div>
                                    {field.type === 'textarea' ? (
                                        <Textarea
                                            value={values[field.key]}
                                            onChange={e => handleChange(field.key, e.target.value)}
                                            placeholder={placeholder}
                                            className="rounded-xl min-h-[100px] text-sm resize-none"
                                        />
                                    ) : (
                                        <Input
                                            value={values[field.key]}
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
