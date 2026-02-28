'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { upsertPageContents } from '@/domains/admin/cms-actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Save,
    Loader2,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    LayoutPanelTop,
    CheckCircle2,
    Settings2,
    GraduationCap,
    Star,
    Award,
    HeartHandshake,
    ChevronRight,
    LucideIcon,
    Upload,
    Image as ImageIcon,
    Shield,
    History,
    Zap,
    Users,
    Globe,
    Search,
    BookOpen
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { toast } from "sonner"
import { motion, AnimatePresence } from 'framer-motion'
import { getSignedUploadUrl } from '../academy-actions'

interface PageContentDynamicEditorProps {
    pageSlug: string
    pageName: string
    currentContent: Record<string, string>
    locale: 'fr' | 'de' | 'it'
}

export function PageContentDynamicEditor({
    pageSlug,
    pageName,
    currentContent,
    locale,
}: PageContentDynamicEditorProps) {
    const [isPending, startTransition] = useTransition()
    const [values, setValues] = useState<Record<string, string>>(currentContent)
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ hero: true })

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const getValue = (key: string) => values[key] ?? ''

    const updateValue = (key: string, val: string) => {
        setValues(prev => ({ ...prev, [key]: val }))
    }

    const getCount = (prefix: string) => {
        // Special case for formations_count vs formation_N
        const countKey = prefix === 'formation' ? 'formations_count' : `${prefix}s_count`
        const c = values[countKey]
        return c ? parseInt(c) : 0
    }

    const addItem = (prefix: string) => {
        const currentCount = getCount(prefix)
        const newCount = currentCount + 1
        const countKey = prefix === 'formation' ? 'formations_count' : `${prefix}s_count`
        setValues(prev => ({
            ...prev,
            [countKey]: newCount.toString()
        }))
    }

    const removeItem = (prefix: string, index: number) => {
        const currentCount = getCount(prefix)
        if (currentCount <= 0) return

        const newValues = { ...values }
        const itemPrefix = `${prefix}_${index}_`
        const nextItemPrefix = `${prefix}${index}` // Try both formats

        // Remove current item fields
        Object.keys(values).forEach(k => {
            if (k.startsWith(`${prefix}_${index}_`) || k.startsWith(`${prefix}${index}_`)) {
                delete newValues[k]
            }
        })

        // Shift subsequent items
        for (let i = index + 1; i <= currentCount; i++) {
            Object.keys(values).forEach(oldKey => {
                const p1 = `${prefix}_${i}_`
                const p2 = `${prefix}${i}_`
                if (oldKey.startsWith(p1)) {
                    const newKey = oldKey.replace(p1, `${prefix}_${i - 1}_`)
                    newValues[newKey] = values[oldKey]
                    delete newValues[oldKey]
                } else if (oldKey.startsWith(p2)) {
                    const newKey = oldKey.replace(p2, `${prefix}${i - 1}_`)
                    newValues[newKey] = values[oldKey]
                    delete newValues[oldKey]
                }
            })
        }

        const countKey = prefix === 'formation' ? 'formations_count' : `${prefix}s_count`
        newValues[countKey] = (currentCount - 1).toString()
        setValues(newValues)
    }

    const moveItem = (prefix: string, fromIndex: number, toIndex: number) => {
        const count = getCount(prefix)
        if (toIndex < 1 || toIndex > count) return

        const newValues = { ...values }
        const fromPrefix = prefix === 'formation' ? `${prefix}_${fromIndex}_` : `${prefix}${fromIndex}_`
        const toPrefix = prefix === 'formation' ? `${prefix}_${toIndex}_` : `${prefix}${toIndex}_`

        const fromFields = Object.keys(values).filter(k => k.startsWith(fromPrefix))
        const toFields = Object.keys(values).filter(k => k.startsWith(toPrefix))

        const temp: Record<string, string> = {}
        fromFields.forEach(k => {
            const subKey = k.replace(fromPrefix, "")
            temp[subKey] = values[k]
            delete newValues[k]
        })

        toFields.forEach(k => {
            const subKey = k.replace(toPrefix, "")
            const newK = `${fromPrefix}${subKey}`
            newValues[newK] = values[k]
            delete newValues[k]
        })

        Object.keys(temp).forEach(subKey => {
            const newK = `${toPrefix}${subKey}`
            newValues[newK] = temp[subKey]
        })

        setValues(newValues)
    }

    const handleSave = async () => {
        startTransition(async () => {
            const result = await upsertPageContents(pageSlug, values, locale)
            if (result.success) {
                toast.success("Contenu enregistré avec succès")
            } else {
                toast.error("Erreur lors de l'enregistrement")
            }
        })
    }

    return (
        <div className="space-y-6 pb-32">

            {/* 1. HERO SECTION */}
            <AdminAccordion
                title="Séquence Hero"
                icon={LayoutPanelTop}
                isOpen={openSections['hero']}
                onToggle={() => toggleSection('hero')}
                visibleKey="formations_section_hero_visible"
                values={values}
                updateValue={updateValue}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                    <Field label="Sobretitre (ex: KRX AESTHETICS SUISSE)" k="formations_hero_overtitle" val={getValue("formations_hero_overtitle")} onChange={updateValue} hint="Badge doré au-dessus du titre (ex: KRX AESTHETICS SUISSE)" />
                    <Field label="H1 - Partie 1 (Noir)" k="formations_hero_title" val={getValue("formations_hero_title")} onChange={updateValue} hint="Titre principal de la page formations" />
                    <Field label="H1 - Partie 2 (Dorado)" k="formations_hero_title2" val={getValue("formations_hero_title2")} onChange={updateValue} hint="Deuxième partie du titre en dorado" />
                    <Field label="Sous-titre" k="formations_hero_subtitle" val={getValue("formations_hero_subtitle")} onChange={updateValue} type="textarea" hint="Description sous le titre du hero" />
                    <UploadField
                        label="Image de fond Hero"
                        k="formations_hero_bg"
                        val={getValue("formations_hero_bg")}
                        onChange={updateValue}
                        hasOverlay
                        values={values}
                        hint="Image de fond pour le hero de la page formations"
                    />
                </div>
            </AdminAccordion>

            <AdminAccordion
                title="Section Avantages"
                icon={CheckCircle2}
                isOpen={openSections['advantages']}
                onToggle={() => toggleSection('advantages')}
                visibleKey="formations_section_advantages_visible"
                values={values}
                updateValue={updateValue}
            >
                <div className="p-8 space-y-6">
                    <Field label="Titre de la section (Overtitle)" k="formations_advantages_overtitle" val={getValue("formations_advantages_overtitle")} onChange={updateValue} />
                    <AnimatePresence>
                        {Array.from({ length: getCount('formations_advantage') }).map((_, i) => (
                            <RepeatableItem
                                key={i}
                                index={i + 1}
                                prefix="formations_advantage"
                                total={getCount('formations_advantage')}
                                values={values}
                                updateValue={updateValue}
                                onRemove={() => removeItem('formations_advantage', i + 1)}
                                onMoveUp={() => moveItem('formations_advantage', i + 1, i)}
                                onMoveDown={() => moveItem('formations_advantage', i + 1, i + 2)}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Titre" k={`formations_advantage${i + 1}_title`} val={values[`formations_advantage${i + 1}_title`]} onChange={updateValue} hint="Titre du pilier/avantage" />
                                    <IconSelector label="Icone" k={`formations_advantage${i + 1}_icon`} val={values[`formations_advantage${i + 1}_icon`]} onChange={updateValue} hint="Icône représentative de cet avantage" />
                                    <div className="md:col-span-2">
                                        <Field label="Description" k={`formations_advantage${i + 1}_desc`} val={values[`formations_advantage${i + 1}_desc`]} onChange={updateValue} type="textarea" hint="Texte explicatif court" />
                                    </div>
                                </div>
                            </RepeatableItem>
                        ))}
                    </AnimatePresence>
                    <Button
                        variant="outline"
                        onClick={() => addItem('formations_advantage')}
                        className="w-full h-12 border-dashed border-2 border-slate-200 hover:border-accent hover:text-accent font-oswald uppercase tracking-widest transition-all rounded-xl gap-2"
                    >
                        <Plus size={16} /> Ajouter un avantage
                    </Button>
                </div>
            </AdminAccordion>

            <AdminAccordion
                title="Catalogue des Formations"
                icon={GraduationCap}
                isOpen={openSections['programmes']}
                onToggle={() => toggleSection('programmes')}
                visibleKey="formations_section_programmes_visible"
                values={values}
                updateValue={updateValue}
            >
                <div className="p-8 space-y-6">
                    <AnimatePresence>
                        {Array.from({ length: getCount('formation') }).map((_, i) => (
                            <FormationItem
                                key={i}
                                index={i + 1}
                                total={getCount('formation')}
                                values={values}
                                updateValue={updateValue}
                                onRemove={() => removeItem('formation', i + 1)}
                                onMoveUp={() => moveItem('formation', i + 1, i)}
                                onMoveDown={() => moveItem('formation', i + 1, i + 2)}
                            />
                        ))}
                    </AnimatePresence>
                    <Button
                        variant="outline"
                        onClick={() => addItem('formation')}
                        className="w-full h-20 border-dashed border-2 border-slate-200 hover:border-accent hover:text-accent font-oswald uppercase tracking-widest transition-all rounded-xl gap-2"
                    >
                        <Plus size={18} /> Ajouter une formation
                    </Button>
                </div>
            </AdminAccordion>

            <AdminAccordion
                title="Section Nos Engagements"
                icon={HeartHandshake}
                isOpen={openSections['engagements']}
                onToggle={() => toggleSection('engagements')}
                visibleKey="formations_section_engagements_visible"
                values={values}
                updateValue={updateValue}
            >
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <Field label="Titre section" k="formations_engagements_title" val={getValue("formations_engagements_title")} onChange={updateValue} />
                        <Field label="Sous-titre section" k="formations_engagements_subtitle" val={getValue("formations_engagements_subtitle")} onChange={updateValue} />
                    </div>
                    <AnimatePresence>
                        {Array.from({ length: getCount('formations_engagement') }).map((_, i) => (
                            <RepeatableItem
                                key={i}
                                index={i + 1}
                                prefix="formations_engagement"
                                total={getCount('formations_engagement')}
                                values={values}
                                updateValue={updateValue}
                                onRemove={() => removeItem('formations_engagement', i + 1)}
                                onMoveUp={() => moveItem('formations_engagement', i + 1, i)}
                                onMoveDown={() => moveItem('formations_engagement', i + 1, i + 2)}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Titre" k={`formations_engagement${i + 1}_title`} val={values[`formations_engagement${i + 1}_title`]} onChange={updateValue} hint="Titre de l'engagement" />
                                    <IconSelector label="Icone" k={`formations_engagement${i + 1}_icon`} val={values[`formations_engagement${i + 1}_icon`]} onChange={updateValue} hint="Icône de l'engagement" />
                                    <div className="md:col-span-2">
                                        <Field label="Description" k={`formations_engagement${i + 1}_desc`} val={values[`formations_engagement${i + 1}_desc`]} onChange={updateValue} type="textarea" hint="Texte descriptif de l'engagement" />
                                    </div>
                                </div>
                            </RepeatableItem>
                        ))}
                    </AnimatePresence>
                    <Button
                        variant="outline"
                        onClick={() => addItem('formations_engagement')}
                        className="w-full h-12 border-dashed border-2 border-slate-200 hover:border-accent hover:text-accent font-oswald uppercase tracking-widest transition-all rounded-xl gap-2"
                    >
                        <Plus size={16} /> Ajouter un engagement
                    </Button>
                </div>
            </AdminAccordion>

            {/* 5. CTA FINAL */}
            <AdminAccordion
                title="Appel à l'Action Final"
                icon={Plus}
                isOpen={openSections['cta']}
                onToggle={() => toggleSection('cta')}
                visibleKey="formations_section_cta_visible"
                values={values}
                updateValue={updateValue}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                    <Field label="Titre (Prête à vous former?)" k="formations_cta_title" val={getValue("formations_cta_title")} onChange={updateValue} hint="Titre de la section finale d'appel à l'action" />
                    <Field label="Sous-titre (Coréenne)" k="formations_cta_subtitle" val={getValue("formations_cta_subtitle")} onChange={updateValue} hint="Sous-titre en doré" />
                    <Field label="Description" k="formations_cta_desc" val={getValue("formations_cta_desc")} onChange={updateValue} type="textarea" hint="Texte descriptif du CTA final" />
                    <Field label="Texte Bouton" k="formations_cta_button_text" val={getValue("formations_cta_button_text")} onChange={updateValue} hint="Libellé du bouton" />
                    <Field label="Lien Bouton" k="formations_cta_button_link" val={getValue("formations_cta_button_link")} onChange={updateValue} hint="URL de destination du bouton" />
                    <Field label="Téléphone Contact" k="formations_cta_phone" val={getValue("formations_cta_phone")} onChange={updateValue} hint="Numéro de téléphone affiché dans le CTA" />
                </div>
            </AdminAccordion>

            {/* SAVE BAR */}
            <div className="fixed bottom-10 right-10 z-50">
                <Button
                    size="lg"
                    onClick={handleSave}
                    disabled={isPending}
                    className="h-16 px-12 bg-accent hover:bg-black text-white font-oswald uppercase tracking-widest rounded-full shadow-2xl gap-3 transition-all hover:scale-105"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                    {isPending ? "Sauvegarde..." : "Enregistrer les modifications"}
                </Button>
            </div>
        </div>
    )
}

function AdminAccordion({ title, icon: Icon, isOpen, onToggle, visibleKey, values, updateValue, children }: any) {
    const isVisible = values[visibleKey] !== 'false'

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all ${!isVisible ? 'opacity-50 grayscale' : ''}`}>
            <div
                className="flex items-center justify-between px-8 py-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Icon size={20} />
                    </div>
                    <h2 className="font-oswald text-sm font-bold uppercase tracking-widest text-[#262626]">{title}</h2>
                </div>
                <div className="flex items-center gap-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section Active</Label>
                        <Switch
                            checked={isVisible}
                            onCheckedChange={checked => updateValue(visibleKey, checked.toString())}
                        />
                    </div>
                    <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-slate-400" />
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="border-t border-slate-100">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function RepeatableItem({ index, prefix, total, values, updateValue, onRemove, onMoveUp, onMoveDown, children }: any) {
    const [isOpen, setIsOpen] = useState(false)
    const isAdv = prefix.includes('advantage')
    const isEng = prefix.includes('engagement')
    const isForm = prefix === 'formation'

    // Key logic to match user schema: prefixN_title
    const itemPrefix = isForm ? `${prefix}_${index}_` : `${prefix}${index}_`
    const titleKey = `${itemPrefix}title`
    const title = values[titleKey] || `${prefix.replace('formations_', '')} #${index}`

    return (
        <motion.div
            layout
            className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4 shadow-sm"
        >
            <div
                className="flex items-center justify-between px-6 py-4 bg-slate-50/50 cursor-pointer hover:bg-slate-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-oswald text-xs italic">
                        {index}
                    </div>
                    <span className="font-oswald text-sm uppercase font-bold text-slate-700">{title}</span>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" disabled={index === 1} onClick={onMoveUp} className="h-8 w-8 p-0"><ChevronUp size={16} /></Button>
                    <Button variant="ghost" size="sm" disabled={index === total} onClick={onMoveDown} className="h-8 w-8 p-0"><ChevronDown size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Supprimer cet item ?")) onRemove() }} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                    <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} className="text-slate-400" />
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="p-8 animate-in slide-in-from-top-2">
                    {children}
                </div>
            )}
        </motion.div>
    )
}

function FormationItem({ index, total, values, updateValue, onRemove, onMoveUp, onMoveDown }: any) {
    const [isOpen, setIsOpen] = useState(false)
    const prefix = `formation_${index}`
    const title = values[`${prefix}_title`] || `Formation #${index}`

    return (
        <motion.div
            layout
            className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4 shadow-sm"
        >
            <div
                className="flex items-center justify-between px-6 py-4 bg-slate-50/50 cursor-pointer hover:bg-slate-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-oswald text-xs italic">
                        {index}
                    </div>
                    <span className="font-oswald text-sm uppercase font-bold text-slate-700">{title}</span>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" disabled={index === 1} onClick={onMoveUp} className="h-8 w-8 p-0"><ChevronUp size={16} /></Button>
                    <Button variant="ghost" size="sm" disabled={index === total} onClick={onMoveDown} className="h-8 w-8 p-0"><ChevronDown size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Supprimer cette formation ?")) onRemove() }} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                    <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} className="text-slate-400" />
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                    <Field label="Titre de la formation" k={`${prefix}_title`} val={values[`${prefix}_title`]} onChange={updateValue} hint="Nom de la formation (ex: Hydraskin)" />
                    <Field label="Badge (ex: 100% En Ligne)" k={`${prefix}_badge`} val={values[`${prefix}_badge`]} onChange={updateValue} hint="Badge en haut à gauche de l'image" />
                    <Field label="Label (ex: Formation E-Learning)" k={`${prefix}_label`} val={values[`${prefix}_label`]} onChange={updateValue} hint="Type de formation affiché en haut" />
                    <UploadField
                        label="Image de Formation"
                        k={`${prefix}_image`}
                        val={values[`${prefix}_image`]}
                        onChange={updateValue}
                        bucket="academy-pdfs"
                        hasOverlay
                        values={values}
                        hint="Image représentative de la formation"
                    />
                    <div className="md:col-span-2">
                        <Field label="Description" k={`${prefix}_description`} val={values[`${prefix}_description`]} onChange={updateValue} type="textarea" hint="Description détaillée de la formation" />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field label="Niveau (ex: Débutant)" k={`${prefix}_level`} val={values[`${prefix}_level`]} onChange={updateValue} hint="Texte du niveau (ex: Avancé)" />
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Étoiles (1-3)</Label>
                            <p className="text-xs text-gray-400 mt-0.5 mb-1 italic">→ Niveau de difficulté: 1=★☆☆, 2=★★☆, 3=★★★</p>
                            <select
                                className="w-full h-12 rounded-xl border-slate-200 bg-white px-3 text-sm focus:border-accent outline-none"
                                value={values[`${prefix}_level_stars`] || '1'}
                                onChange={e => updateValue(`${prefix}_level_stars`, e.target.value)}
                            >
                                <option value="1">1 Étoile ★☆☆</option>
                                <option value="2">2 Étoiles ★★☆</option>
                                <option value="3">3 Étoiles ★★★</option>
                            </select>
                        </div>
                        <Field label="Prérequis" k={`${prefix}_prerequisites`} val={values[`${prefix}_prerequisites`]} onChange={updateValue} hint="Conditions requises pour s'inscrire" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <Field label="Prix (ex: 599)" k={`${prefix}_price`} val={values[`${prefix}_price`]} onChange={updateValue} hint="Prix affiché en grand" />
                        <Field label="Devise (ex: CHF)" k={`${prefix}_currency`} val={values[`${prefix}_currency`] || 'CHF'} onChange={updateValue} hint="Devise monétaire" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <Field label="Texte Bouton" k={`${prefix}_cta_text`} val={values[`${prefix}_cta_text`] || "S'inscrire à la Formation"} onChange={updateValue} hint="Texte du bouton sur la carte" />
                        <Field label="Lien Bouton (URL)" k={`${prefix}_cta_link`} val={values[`${prefix}_cta_link`]} onChange={updateValue} hint="Lien de destination du bouton" />
                    </div>
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Titre List Info" k={`${prefix}_info_title`} val={values[`${prefix}_info_title`] || "Informations Essentielles"} onChange={updateValue} hint="Titre pour la liste d'infos" />
                            <Field label="Titre List Inclus" k={`${prefix}_included_title`} val={values[`${prefix}_included_title`] || "Inclus dans la Formation"} onChange={updateValue} hint="Titre pour la liste de ce qui est inclus" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Informations Essentielles (Use | for separators or 1 per line)" k={`${prefix}_info_items`} val={values[`${prefix}_info_items`]} onChange={updateValue} type="textarea" placeholder="Vidéos pratiques|Livret PDF|..." hint="Liste d'infos clés (séparer par |)" />
                            <Field label="Inclus dans la Formation (Use | for separators or 1 per line)" k={`${prefix}_included_items`} val={values[`${prefix}_included_items`]} onChange={updateValue} type="textarea" placeholder="Certificat personnalisé|Suivi illimité|..." hint="Liste des composants inclus (séparer par |)" />
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
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
                            <Field label="Lien Bouton CTA" k={`${k}_overlay_cta_link`} val={values[`${k}_overlay_cta_link`]} onChange={onChange} hint="URL de destination du bouton" />
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

function IconSelector({ label, k, val, onChange, hint }: any) {
    const icons = [
        { name: 'Star', icon: Star },
        { name: 'Award', icon: Award },
        { name: 'CheckCircle2', icon: CheckCircle2 },
        { name: 'GraduationCap', icon: GraduationCap },
        { name: 'HeartHandshake', icon: HeartHandshake },
        { name: 'Shield', icon: Shield },
        { name: 'History', icon: History },
        { name: 'Zap', icon: Zap },
        { name: 'Users', icon: Users },
        { name: 'Globe', icon: Globe },
        { name: 'BookOpen', icon: BookOpen },
        { name: 'Search', icon: Search },
    ]

    return (
        <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</Label>
            {hint && (
                <p className="text-xs text-gray-400 mt-0.5 mb-1 italic">
                    → {hint}
                </p>
            )}
            <div className="grid grid-cols-6 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {icons.map(item => (
                    <button
                        key={item.name}
                        onClick={() => onChange(k, item.name)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${val === item.name ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white hover:bg-slate-100 text-slate-400'}`}
                        title={item.name}
                    >
                        <item.icon size={16} />
                    </button>
                ))}
            </div>
            <Input
                value={val || ''}
                onChange={e => onChange(k, e.target.value)}
                placeholder="Nom de l'icone Lucide..."
                className="h-10 rounded-xl border-slate-200 text-[10px]"
            />
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
