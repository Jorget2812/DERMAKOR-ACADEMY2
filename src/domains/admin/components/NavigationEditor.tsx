'use client'

import React, { useState } from 'react'
import { useRouter } from '@/navigation'
import { NavItem, NavItemStyle, upsertNavItem, deleteNavItem, updateSiteSetting, reorderNavItems } from '../nav-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Layout,
    Link as LinkIcon,
    Palette,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Type,
    Search,
    Globe,
    Eye,
    EyeOff,
    ExternalLink,
    ChevronRight,
    ArrowRight,
    Settings,
    Grid
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NavigationEditorProps {
    initialItems: NavItem[]
    initialSettings: Record<string, any>
}

export function NavigationEditor({ initialItems, initialSettings }: NavigationEditorProps) {
    const router = useRouter()
    const [items, setItems] = useState<NavItem[]>(initialItems)
    const [settings, setSettings] = useState(initialSettings)
    const [loading, setLoading] = useState(false)

    // Helper: Build tree
    const rootItems = items.filter(i => !i.parent_id)

    // Site Settings Handlers
    const handleSettingChange = async (key: string, value: any) => {
        try {
            setLoading(true)
            await updateSiteSetting(key, value)
            setSettings(prev => ({ ...prev, [key]: value }))
            toast.success("Paramètre mis à jour")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Nav Item Handlers
    const handleSaveItem = async (item: Partial<NavItem>) => {
        // Validation: label_fr is mandatory
        if (item.label_fr === '') {
            toast.error("Le label français est obligatoire")
            return
        }

        try {
            setLoading(true)
            const updated = await upsertNavItem(item)
            setItems(prev => {
                const exists = prev.find(i => i.id === updated.id)
                if (exists) return prev.map(i => i.id === updated.id ? updated : i)
                return [...prev, updated]
            })
            toast.success("Modifications enregistrées")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Supprimer cet élément de navigation ? (Les sous-menus seront également supprimés)")) return
        try {
            setLoading(true)
            await deleteNavItem(id)
            setItems(prev => prev.filter(i => i.id !== id && i.parent_id !== id))
            toast.success("Élément supprimé")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleReorder = async (id: string, dir: 'up' | 'down') => {
        const item = items.find(i => i.id === id)
        if (!item) return

        const siblings = items.filter(i => i.parent_id === item.parent_id)
        const idx = siblings.findIndex(i => i.id === id)

        if (dir === 'up' && idx === 0) return
        if (dir === 'down' && idx === siblings.length - 1) return

        const targetIdx = dir === 'up' ? idx - 1 : idx + 1
        const target = siblings[targetIdx]

        const updates = [
            { id: item.id, display_order: target.display_order },
            { id: target.id, display_order: item.display_order }
        ]

        try {
            setLoading(true)
            await reorderNavItems(updates)
            setItems(prev => prev.map(i => {
                const update = updates.find(u => u.id === i.id)
                return update ? { ...i, display_order: update.display_order } : i
            }).sort((a, b) => a.display_order - b.display_order))
            toast.success("Ordre mis à jour")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Left: General Settings */}
            <div className="xl:col-span-4 space-y-8">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-row items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-accent">
                            <Settings size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-serif">En-tête & Logo</CardTitle>
                            <CardDescription className="text-[10px] uppercase tracking-wider font-medium">Configuration du Header</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Texte du Logo</Label>
                                <Input
                                    defaultValue={settings.logo_text}
                                    onBlur={(e) => handleSettingChange('logo_text', e.target.value)}
                                    className="h-10 rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Sous-titre du Logo</Label>
                                <Input
                                    defaultValue={settings.logo_subtitle}
                                    onBlur={(e) => handleSettingChange('logo_subtitle', e.target.value)}
                                    className="h-10 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 flex flex-col items-start gap-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Recherche</Label>
                                <Switch
                                    checked={settings.header_show_search === true || settings.header_show_search === "true"}
                                    onCheckedChange={(v) => handleSettingChange('header_show_search', v)}
                                />
                            </div>
                            <div className="space-y-1.5 flex flex-col items-start gap-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Sélecteur Langue</Label>
                                <Switch
                                    checked={settings.header_show_language_selector === true || settings.header_show_language_selector === "true"}
                                    onCheckedChange={(v) => handleSettingChange('header_show_language_selector', v)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Identité Visuelle (Couleurs)</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <div className="w-full h-8 rounded-lg border border-slate-200" style={{ backgroundColor: settings.header_background_color || '#FFFFFF' }} />
                                    <Input
                                        defaultValue={settings.header_background_color}
                                        onBlur={(e) => handleSettingChange('header_background_color', e.target.value)}
                                        className="h-8 text-[9px] font-mono p-1 text-center"
                                    />
                                    <span className="text-[8px] uppercase text-center block text-slate-400">Fond</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-full h-8 rounded-lg border border-slate-200" style={{ backgroundColor: settings.header_text_color || '#262626' }} />
                                    <Input
                                        defaultValue={settings.header_text_color}
                                        onBlur={(e) => handleSettingChange('header_text_color', e.target.value)}
                                        className="h-8 text-[9px] font-mono p-1 text-center"
                                    />
                                    <span className="text-[8px] uppercase text-center block text-slate-400">Texte</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-full h-8 rounded-lg border border-slate-200" style={{ backgroundColor: settings.header_accent_color || '#C0A76A' }} />
                                    <Input
                                        defaultValue={settings.header_accent_color}
                                        onBlur={(e) => handleSettingChange('header_accent_color', e.target.value)}
                                        className="h-8 text-[9px] font-mono p-1 text-center"
                                    />
                                    <span className="text-[8px] uppercase text-center block text-slate-400">Accent</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900 text-[11px] leading-relaxed flex gap-3">
                    <Layout className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                        <strong>Attention :</strong> Les modifications de couleurs et de logo s'appliquent immédiatement à toutes les pages publiques (Header Desktop et Mobile).
                    </div>
                </div>
            </div>

            {/* Right: Navigation Tree */}
            <div className="xl:col-span-8 space-y-6">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-serif">Menu de Navigation</CardTitle>
                            <CardDescription className="text-xs font-light uppercase tracking-widest mt-1">Gérez la structure et les liens du menu principal</CardDescription>
                        </div>
                        <Button
                            onClick={() => handleSaveItem({
                                label_fr: 'Nouveau lien',
                                display_order: items.length + 1,
                                is_visible: true,
                                is_dropdown: false,
                                style: 'normal'
                            })}
                            className="bg-slate-900 hover:bg-black rounded-xl h-10 px-5 text-[10px] font-bold uppercase tracking-widest gap-2"
                        >
                            <Plus size={14} /> Ajouter un élément
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {rootItems.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <Grid size={48} className="mx-auto text-slate-100" />
                                <p className="text-slate-400 text-sm italic">Aucun élément de navigation défini.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rootItems.sort((a, b) => a.display_order - b.display_order).map((item) => (
                                    <NavItemRow
                                        key={item.id}
                                        item={item}
                                        allItems={items}
                                        onSave={handleSaveItem}
                                        onDelete={handleDeleteItem}
                                        onReorder={handleReorder}
                                        onAddChild={(parentId) => handleSaveItem({
                                            label_fr: 'Nouveau sous-lien',
                                            parent_id: parentId,
                                            display_order: items.filter(i => i.parent_id === parentId).length + 1,
                                            is_visible: true,
                                            is_dropdown: false,
                                            style: 'normal'
                                        })}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function NavItemRow({ item, allItems, onSave, onDelete, onReorder, onAddChild }: {
    item: NavItem,
    allItems: NavItem[],
    onSave: (item: Partial<NavItem>) => Promise<any>,
    onDelete: (id: string) => Promise<any>,
    onReorder: (id: string, dir: 'up' | 'down') => Promise<any>,
    onAddChild: (parentId: string) => Promise<any>
}) {
    const [isEditing, setIsEditing] = useState(false)
    const children = allItems.filter(i => i.parent_id === item.id).sort((a, b) => a.display_order - b.display_order)

    return (
        <div className="space-y-2">
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${isEditing ? 'border-accent ring-1 ring-accent/20 bg-accent/5' : 'border-slate-100 bg-slate-50/30'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <button onClick={() => onReorder(item.id, 'up')} className="p-1 hover:text-accent text-slate-300 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => onReorder(item.id, 'down')} className="p-1 hover:text-accent text-slate-300 transition-colors"><ChevronDown size={14} /></button>
                    </div>

                    <div className="flex-grow flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-accent shadow-sm">
                            <LinkIcon size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{item.label_fr}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{item.link || '(Menu Déroulant)'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-[9px] font-bold uppercase text-slate-400 tracking-tighter">
                            <span>Style: {item.style}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(prev => !prev)}
                            className="h-8 rounded-lg text-[10px] uppercase font-bold text-accent"
                        >
                            {isEditing ? 'Fermer' : 'Modifier'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/5"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 pt-6 border-t border-accent/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                        <Tabs defaultValue="fr" className="w-full">
                            <TabsList className="bg-white/50 border border-border/40 mb-4 h-9">
                                <TabsTrigger value="fr" className="text-[10px] font-bold">FR</TabsTrigger>
                                <TabsTrigger value="de" className="text-[10px] font-bold">DE</TabsTrigger>
                                <TabsTrigger value="it" className="text-[10px] font-bold">IT</TabsTrigger>
                            </TabsList>
                            <TabsContent value="fr" className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Label Français</Label>
                                    <Input defaultValue={item.label_fr} onBlur={(e) => onSave({ ...item, label_fr: e.target.value })} className="h-9 text-xs rounded-lg" />
                                </div>
                            </TabsContent>
                            <TabsContent value="de" className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Label Allemand</Label>
                                    <Input defaultValue={item.label_de || ''} onBlur={(e) => onSave({ ...item, label_de: e.target.value })} className="h-9 text-xs rounded-lg" />
                                </div>
                            </TabsContent>
                            <TabsContent value="it" className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Label Italien</Label>
                                    <Input defaultValue={item.label_it || ''} onBlur={(e) => onSave({ ...item, label_it: e.target.value })} className="h-9 text-xs rounded-lg" />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] uppercase font-bold text-slate-400">Lien (URL)</Label>
                                <Input
                                    defaultValue={item.link || ''}
                                    onBlur={(e) => onSave({ ...item, link: e.target.value })}
                                    placeholder="/fr/shop, https://..."
                                    className="h-9 text-xs rounded-lg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Style d'affichage</Label>
                                    <select
                                        defaultValue={item.style}
                                        onChange={(e) => {
                                            const newStyle = e.target.value as NavItemStyle;
                                            onSave({ id: item.id, label_fr: item.label_fr, style: newStyle });
                                        }}
                                        className="w-full h-9 rounded-lg border border-slate-200 bg-white text-xs px-2"
                                    >
                                        <option value="normal">Normal (Texte)</option>
                                        <option value="outline">Outline (Bordure)</option>
                                        <option value="button_gold">Bouton Doré</option>
                                        <option value="button_outline">Bouton Contour</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Icône (Lucide)</Label>
                                    <Input defaultValue={item.icon || ''} onBlur={(e) => onSave({ ...item, icon: e.target.value })} className="h-9 text-xs rounded-lg" placeholder="ex: Home, User" />
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch checked={item.is_visible} onCheckedChange={(v) => onSave({ id: item.id, label_fr: item.label_fr, is_visible: v })} />
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Visible</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={item.is_dropdown} onCheckedChange={(v) => onSave({ id: item.id, label_fr: item.label_fr, is_dropdown: v })} />
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Dropdown</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch checked={item.open_in_new_tab} onCheckedChange={(v) => onSave({ id: item.id, label_fr: item.label_fr, open_in_new_tab: v })} />
                                    <Label className="text-[9px] uppercase font-bold text-slate-400">Nouvel Onglet</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sub-items list */}
            {children.length > 0 && (
                <div className="pl-12 space-y-2 border-l-2 border-slate-100 ml-4">
                    {children.map(child => (
                        <NavItemRow
                            key={child.id}
                            item={child}
                            allItems={allItems}
                            onSave={onSave}
                            onDelete={onDelete}
                            onReorder={onReorder}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}

            {/* Add child button if is_dropdown is true */}
            {(item.is_dropdown || item.link === null) && (
                <div className="pl-12">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddChild(item.id)}
                        className="h-8 text-[9px] uppercase font-bold text-slate-400 hover:text-accent gap-2"
                    >
                        <Plus size={12} /> AJOUTER UN SOUS-MENU
                    </Button>
                </div>
            )}
        </div>
    )
}
