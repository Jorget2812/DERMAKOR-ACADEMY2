'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout, Globe, Shield, Save, Eye, Sparkles } from 'lucide-react'
import { upsertDashboardSettings, getDashboardSettings, DashboardSettings, UserLevel, Locale } from '../cms-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const LEVELS: UserLevel[] = ['STANDARD', 'PREMIUM']
const LOCALES: Locale[] = ['fr', 'it', 'de']

export function DashboardSettingsForm() {
    const [activeLocale, setActiveLocale] = useState<Locale>('fr')
    const [activeLevel, setActiveLevel] = useState<UserLevel>('STANDARD')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const defaultSettings: DashboardSettings = {
        level: activeLevel,
        locale: activeLocale,
        enabled: true,
        hero_title: '',
        hero_body: '',
        hero_cta_label: 'Commander en boutique',
        hero_cta_href: '/app/shop',
        card1_title: '',
        card1_body: '',
        card1_icon: 'ShoppingBag',
        card2_title: '',
        card2_body: '',
        card2_icon: 'GraduationCap',
        hero_bg_color: '#0F172A',
        hero_title_color: '#FFFFFF',
        hero_body_color: '#94A3B8'
    }

    const [settings, setSettings] = useState<DashboardSettings>(defaultSettings)

    useEffect(() => { load() }, [activeLocale, activeLevel])

    async function load() {
        setLoading(true)
        try {
            const data = await getDashboardSettings(activeLevel, activeLocale)
            setSettings(data || { ...defaultSettings })
        } catch (error: any) {
            console.error(error)
            toast.error("Erreur de chargement")
            setSettings({ ...defaultSettings })
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            await upsertDashboardSettings(settings)
            toast.success("Contenu mis à jour avec succès")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-[#EEEEEE] shadow-sm">
                <div className="flex items-center gap-8">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Langue Target</Label>
                        <div className="flex gap-2">
                            {LOCALES.map(loc => (
                                <button
                                    key={loc}
                                    onClick={() => setActiveLocale(loc)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                                        activeLocale === loc ? "bg-primary text-white" : "bg-[#F8F9FA] text-primary/40 hover:text-primary"
                                    )}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1 border-l border-[#EEEEEE] pl-8">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Niveau de Partenariat</Label>
                        <div className="flex gap-2">
                            {LEVELS.map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setActiveLevel(lvl)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                                        activeLevel === lvl ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-[#F8F9FA] text-primary/40 hover:text-primary"
                                    )}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-[#F8F9FA] rounded-2xl border border-[#EEEEEE]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Status</span>
                        <Switch
                            checked={settings.enabled}
                            onCheckedChange={(v) => setSettings(s => ({ ...s, enabled: v }))}
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="h-12 px-8 rounded-2xl bg-primary text-white hover:bg-black font-bold uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/10"
                    >
                        <Save size={16} /> {saving ? "Enregistrement..." : "Publier les changements"}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-12 gap-8 h-96 bg-white/50 rounded-[40px] animate-pulse" />
            ) : (
                <div className="grid grid-cols-12 gap-8">
                    {/* Editor Column */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                        {/* Section Hero */}
                        <div className="bg-white p-10 rounded-[40px] border border-[#EEEEEE] shadow-sm space-y-10">
                            <div className="flex items-center gap-4 border-b border-[#F5F5F5] pb-6">
                                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-serif">Section Hero & Titre</h2>
                                    <p className="text-[10px] text-primary/40 uppercase tracking-widest">Contenu principal du dashboard</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Titre Principal</Label>
                                    <Input
                                        id="hero_title"
                                        value={settings.hero_title || ''}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            setSettings(s => ({ ...s, hero_title: v }))
                                        }}
                                        className="h-14 bg-[#FDFCFB] border-[#EEEEEE] rounded-2xl px-6 text-base focus-visible:ring-accent/20"
                                        placeholder="Ex: Privilèges Premium Activés"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Corps de texte</Label>
                                    <Textarea
                                        id="hero_body"
                                        value={settings.hero_body || ''}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            setSettings(s => ({ ...s, hero_body: v }))
                                        }}
                                        className="min-h-[120px] bg-[#FDFCFB] border-[#EEEEEE] rounded-3xl p-6 text-sm leading-relaxed focus-visible:ring-accent/20"
                                        placeholder="Décrivez les avantages du niveau..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Label Bouton</Label>
                                        <Input
                                            id="hero_cta_label"
                                            value={settings.hero_cta_label || ''}
                                            onChange={(e) => {
                                                const v = e.target.value
                                                setSettings(s => ({ ...s, hero_cta_label: v }))
                                            }}
                                            className="h-12 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl px-4 text-xs font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Lien (URL)</Label>
                                        <Input
                                            id="hero_cta_href"
                                            value={settings.hero_cta_href || ''}
                                            onChange={(e) => {
                                                const v = e.target.value
                                                setSettings(s => ({ ...s, hero_cta_href: v }))
                                            }}
                                            className="h-12 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl px-4 text-xs font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#F5F5F5]">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Couleur Fond</Label>
                                        <div className="flex gap-2">
                                            <div className="w-12 h-12 rounded-xl border border-[#EEEEEE]" style={{ backgroundColor: settings.hero_bg_color || '#0F172A' }} />
                                            <Input
                                                id="hero_bg_color"
                                                value={settings.hero_bg_color || '#0F172A'}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    setSettings(s => ({ ...s, hero_bg_color: v }))
                                                }}
                                                className="h-12 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl px-4 text-xs font-mono"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Couleur Titre</Label>
                                        <div className="flex gap-2">
                                            <div className="w-12 h-12 rounded-xl border border-[#EEEEEE]" style={{ backgroundColor: settings.hero_title_color || '#FFFFFF' }} />
                                            <Input
                                                id="hero_title_color"
                                                value={settings.hero_title_color || '#FFFFFF'}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    setSettings(s => ({ ...s, hero_title_color: v }))
                                                }}
                                                className="h-12 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl px-4 text-xs font-mono"
                                                placeholder="#FFFFFF"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Couleur Texte</Label>
                                        <div className="flex gap-2">
                                            <div className="w-12 h-12 rounded-xl border border-[#EEEEEE]" style={{ backgroundColor: settings.hero_body_color || '#94A3B8' }} />
                                            <Input
                                                id="hero_body_color"
                                                value={settings.hero_body_color || '#94A3B8'}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    setSettings(s => ({ ...s, hero_body_color: v }))
                                                }}
                                                className="h-12 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl px-4 text-xs font-mono"
                                                placeholder="#94A3B8"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cards Section */}
                        <div className="bg-white p-10 rounded-[40px] border border-[#EEEEEE] shadow-sm space-y-10">
                            <div className="flex items-center gap-4 border-b border-[#F5F5F5] pb-6">
                                <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                    <Layout size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-serif">Quick Cards (Boutique & Académie)</h2>
                                    <p className="text-[10px] text-primary/40 uppercase tracking-widest">Liens rapides du bas</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                {/* Card 1 */}
                                <div className="space-y-6">
                                    <div className="p-4 bg-secondary/30 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-primary/40">Card 1 (Gauche)</div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                id="card1_title"
                                                value={settings.card1_title || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    setSettings(s => ({ ...s, card1_title: v }))
                                                }}
                                                placeholder="Titre Card 1"
                                                className="h-11 rounded-xl"
                                            />
                                            <Input
                                                id="card1_icon"
                                                value={settings.card1_icon || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    setSettings(s => ({ ...s, card1_icon: v }))
                                                }}
                                                placeholder="Icon (ex: ShoppingBag)"
                                                className="h-11 rounded-xl font-mono text-[10px]"
                                            />
                                        </div>
                                        <Textarea
                                            id="card1_body"
                                            value={settings.card1_body || ''}
                                            onChange={(e) => {
                                                const v = e.target.value
                                                setSettings(s => ({ ...s, card1_body: v }))
                                            }}
                                            placeholder="Description Card 1"
                                            className="min-h-[80px] rounded-xl"
                                        />
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="space-y-6">
                                    <div className="p-4 bg-secondary/30 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-primary/40">Card 2 (Droite)</div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                id="card2_title"
                                                value={settings.card2_title || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    setSettings(s => ({ ...s, card2_title: v }))
                                                }}
                                                placeholder="Titre Card 2"
                                                className="h-11 rounded-xl"
                                            />
                                            <Input
                                                id="card2_icon"
                                                value={settings.card2_icon || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    setSettings(s => ({ ...s, card2_icon: v }))
                                                }}
                                                placeholder="Icon (ex: GraduationCap)"
                                                className="h-11 rounded-xl font-mono text-[10px]"
                                            />
                                        </div>
                                        <Textarea
                                            id="card2_body"
                                            value={settings.card2_body || ''}
                                            onChange={(e) => {
                                                const v = e.target.value
                                                setSettings(s => ({ ...s, card2_body: v }))
                                            }}
                                            placeholder="Description Card 2"
                                            className="min-h-[80px] rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className="col-span-12 lg:col-span-5">
                        <div className="sticky top-8 bg-[#1A1A1A] p-10 rounded-[48px] border border-white/5 shadow-2xl text-white space-y-8">
                            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                <Eye size={16} className="text-accent" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Live Preview (Mockup)</span>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="h-4 w-32 bg-white/5 rounded-full" />
                                <div className="h-8 w-64 bg-white/10 rounded-full" />

                                <div
                                    className="p-8 rounded-[40px] border border-white/10 space-y-6 mt-12 transition-all duration-300"
                                    style={{ backgroundColor: settings.hero_bg_color || 'transparent', backgroundImage: !settings.hero_bg_color ? 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent)' : 'none' }}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-serif" style={{ color: settings.hero_title_color || '#FFFFFF' }}>
                                            {settings.hero_title || 'Titre Preview'}
                                        </h4>
                                        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: settings.hero_body_color || 'rgba(255,255,255,0.6)' }}>
                                            {settings.hero_body || 'Corps de texte preview...'}
                                        </p>
                                    </div>
                                    <Button className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                                        {settings.hero_cta_label || 'CTA Button'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
