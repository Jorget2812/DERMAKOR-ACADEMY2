'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { upsertProductBadge, getProductBadges, ProductBadge, UserLevel, Locale } from '../cms-actions'
import { toast } from 'sonner'
import { Sparkles, Globe, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeEditorProps {
    productId: string
}

const LEVELS: UserLevel[] = ['NONE', 'STANDARD', 'PREMIUM']
const LOCALES: Locale[] = ['fr', 'it', 'de']

export function BadgeEditor({ productId }: BadgeEditorProps) {
    const [badges, setBadges] = useState<ProductBadge[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [activeLocale, setActiveLocale] = useState<Locale>('fr')
    const [activeLevel, setActiveLevel] = useState<UserLevel>('STANDARD')

    useEffect(() => {
        loadBadges()
    }, [productId])

    async function loadBadges() {
        try {
            const data = await getProductBadges(productId)
            setBadges(data)
        } catch (error: any) {
            toast.error("Erreur lors du chargement des badges")
        } finally {
            setLoading(false)
        }
    }

    const currentBadge = badges.find(b => b.locale === activeLocale && b.level === activeLevel) || {
        product_id: productId,
        level: activeLevel,
        locale: activeLocale,
        badge_text: '',
        enabled: false
    }

    async function handleSave(text: string, enabled: boolean) {
        setSaving(true)
        try {
            const { data } = await upsertProductBadge({
                ...currentBadge,
                badge_text: text,
                enabled: enabled
            } as ProductBadge)

            // Update local state
            setBadges(prev => {
                const filtered = prev.filter(b => !(b.locale === activeLocale && b.level === activeLevel))
                return [...filtered, data as ProductBadge]
            })
            toast.success("Badge mis à jour")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="animate-pulse h-40 bg-secondary/20 rounded-3xl" />

    return (
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-accent" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Marketing / Badge Exclusif</h3>
                    </div>
                    <p className="text-[10px] text-primary/40 uppercase tracking-tight">Configurez des badges personnalisés por chaque niveau d'accès et langue.</p>
                </div>
                {currentBadge.enabled && currentBadge.badge_text && (
                    <Badge className="bg-accent/10 text-accent border-accent/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Preview: {currentBadge.badge_text}
                    </Badge>
                )}
            </div>

            <div className="space-y-6">
                {/* Language Tabs */}
                <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as Locale)} className="w-full">
                    <TabsList className="bg-[#F8F9FA] p-1 rounded-xl h-11 border border-[#EEEEEE]">
                        {LOCALES.map(loc => (
                            <TabsTrigger
                                key={loc}
                                value={loc}
                                className="rounded-lg text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <Globe size={12} className="mr-2 opacity-40" /> {loc}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Level Selector */}
                <div className="flex gap-2 p-1 bg-[#F8F9FA] rounded-[18px] border border-[#EEEEEE] w-fit">
                    {LEVELS.map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => setActiveLevel(lvl)}
                            className={cn(
                                "px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeLevel === lvl ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:text-primary"
                            )}
                        >
                            <Shield size={12} className={cn("inline mr-2", activeLevel === lvl ? "opacity-100" : "opacity-40")} />
                            {lvl}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-[#F1F1F1]">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Activer le badge</Label>
                        <Switch
                            checked={currentBadge.enabled}
                            onCheckedChange={(checked) => handleSave(currentBadge.badge_text, checked)}
                            disabled={saving}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Texte du Badge</Label>
                        <div className="flex gap-3">
                            <Input
                                value={currentBadge.badge_text}
                                onChange={(e) => {
                                    const text = e.target.value
                                    setBadges(prev => {
                                        const filtered = prev.filter(b => !(b.locale === activeLocale && b.level === activeLevel))
                                        return [...filtered, { ...currentBadge, badge_text: text } as ProductBadge]
                                    })
                                }}
                                className="h-11 rounded-xl border-[#EEEEEE] bg-[#FDFCFB] text-sm focus-visible:ring-accent"
                                placeholder="Ex: Exclusif Pro -60%"
                            />
                            <Button
                                onClick={() => handleSave(currentBadge.badge_text, currentBadge.enabled)}
                                disabled={saving}
                                className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-black font-bold uppercase text-[10px] tracking-widest shrink-0"
                            >
                                {saving ? "..." : "Appliquer"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
