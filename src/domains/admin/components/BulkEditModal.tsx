'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, DollarSign, Package, Layers, Info } from 'lucide-react'

interface BulkEditModalProps {
    categories: any[]
    selectedCount: number // -1 for ALL_MATCHING
    onClose: () => void
    onSubmit: (updates: { base_price_cents?: number; stock_count?: number }) => Promise<void>
    onCategorySubmit: (categoryId: string) => Promise<void>
}

export function BulkEditModal({ categories, selectedCount, onClose, onSubmit, onCategorySubmit }: BulkEditModalProps) {
    const [priceValue, setPriceValue] = useState('')
    const [stockValue, setStockValue] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden bg-white rounded-2xl">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-serif text-slate-900">Édition Masiva</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                            Modificación de {selectedCount === -1 ? 'tous les résultats' : `${selectedCount} ítems`}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-400">
                        <X size={20} />
                    </Button>
                </div>

                <div className="p-6">
                    <Tabs defaultValue="price" className="space-y-6">
                        <TabsList className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl h-12">
                            <TabsTrigger value="price" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-tight">Prix</TabsTrigger>
                            <TabsTrigger value="stock" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-tight">Stock</TabsTrigger>
                            <TabsTrigger value="category" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-bold uppercase tracking-tight">Catégorie</TabsTrigger>
                        </TabsList>

                        <TabsContent value="price" className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3 text-blue-800">
                                <Info size={18} className="shrink-0 mt-0.5" />
                                <p className="text-xs leading-relaxed">
                                    Cela mettra à jour le <strong>prix de base (Retail)</strong>. Le prix PRO sera recalculé automatiquement selon les règles de Pricing Pro.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Nouveau Prix (CHF)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif">CHF</div>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={priceValue}
                                        onChange={(e) => setPriceValue(e.target.value)}
                                        className="h-12 pl-14 pr-4 rounded-xl border-slate-200 focus:ring-accent/20"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={async () => {
                                    setIsSubmitting(true)
                                    await onSubmit({ base_price_cents: Math.round(parseFloat(priceValue) * 100) })
                                    setIsSubmitting(false)
                                }}
                                disabled={!priceValue || isSubmitting}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl"
                            >
                                {isSubmitting ? "Mise à jour..." : "Appliquer le prix"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="stock" className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Nouvelle Quantité</label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={stockValue}
                                        onChange={(e) => setStockValue(e.target.value)}
                                        className="h-12 pl-12 pr-4 rounded-xl border-slate-200 focus:ring-accent/20"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={async () => {
                                    setIsSubmitting(true)
                                    await onSubmit({ stock_count: parseInt(stockValue) })
                                    setIsSubmitting(false)
                                }}
                                disabled={!stockValue || isSubmitting}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl"
                            >
                                {isSubmitting ? "Mise à jour..." : "Actualiser le stock"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="category" className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Choisir une catégorie</label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="h-12 px-4 rounded-xl border-slate-200 focus:ring-accent/20 bg-white">
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id} className="text-sm py-3 rounded-lg">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={async () => {
                                    setIsSubmitting(true)
                                    await onCategorySubmit(categoryId)
                                    setIsSubmitting(false)
                                }}
                                disabled={!categoryId || isSubmitting}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl"
                            >
                                {isSubmitting ? "Mise à jour..." : "Déplacer dans la catégorie"}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 text-[13px]">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px]">
                        Fermer
                    </Button>
                </div>
            </Card>
        </div>
    )
}
