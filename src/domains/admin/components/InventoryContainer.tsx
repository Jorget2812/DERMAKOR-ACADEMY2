'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Package, Layers, AlertTriangle, Edit2, Trash2, Plus, FileText } from 'lucide-react'
import { AdjustStockButton } from './AdjustStockButton'
import { InventoryForm } from './InventoryForm'
import { Link } from '@/navigation'
import { deleteProduct } from '@/domains/admin/product-actions'
import { toast } from 'sonner'

interface InventoryContainerProps {
    initialProducts: any[]
    categories: any[]
}

import { bulkUpdateVariants, bulkUpdateProductsCategory, bulkUpdateIndividualVariants } from '@/domains/admin/inventory-actions'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BulkEditModal } from './BulkEditModal'

interface InventoryContainerProps {
    initialProducts: any[]
    categories: any[]
}

export function InventoryContainer({ initialProducts, categories }: InventoryContainerProps) {
    const [search, setSearch] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [selectionMode, setSelectionMode] = useState<'MANUAL' | 'ALL_MATCHING'>('MANUAL')
    const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())

    // Inline editing state
    const [pendingChanges, setPendingChanges] = useState<Record<string, { base_price_cents?: number; stock_count?: number; category_id?: string }>>({})
    const [isSaving, setIsSaving] = useState(false)

    // Bulk Modal state
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

    // Flatten products and variants for the table
    const allVariants = initialProducts.flatMap(p =>
        (p.product_variants || []).map((v: any) => ({
            ...v,
            product_name: p.name,
            product_image: p.images?.[0],
            category_name: p.categories?.name,
            category_id: p.category_id,
            product_vendor: p.vendor
        }))
    )

    const filteredVariants = allVariants.filter(v =>
        v.product_name.toLowerCase().includes(search.toLowerCase()) ||
        v.sku.toLowerCase().includes(search.toLowerCase())
    )

    // Selection helpers
    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
            if (selectionMode === 'ALL_MATCHING') {
                const newExcluded = new Set(excludedIds)
                newExcluded.add(id)
                setExcludedIds(newExcluded)
            }
        } else {
            newSelected.add(id)
            if (selectionMode === 'ALL_MATCHING') {
                const newExcluded = new Set(excludedIds)
                newExcluded.delete(id)
                setExcludedIds(newExcluded)
            }
        }
        setSelectedIds(newSelected)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredVariants.length) {
            setSelectedIds(new Set())
            setSelectionMode('MANUAL')
            setExcludedIds(new Set())
        } else {
            const ids = filteredVariants.map(v => v.id)
            setSelectedIds(new Set(ids))
        }
    }

    const selectAllMatching = () => {
        setSelectionMode('ALL_MATCHING')
        setExcludedIds(new Set())
        // Visual sugar: select all currently visible too
        const ids = filteredVariants.map(v => v.id)
        setSelectedIds(new Set(ids))
    }

    // Inline Update Handler
    const handleSavePending = async () => {
        setIsSaving(true)
        try {
            const updatesList = Object.entries(pendingChanges).map(([id, change]) => ({
                id,
                ...change
            }))

            // Separate variant updates and product category updates
            const variantUpdates = updatesList.filter(u => u.base_price_cents !== undefined || u.stock_count !== undefined)
            const categoryUpdates = updatesList.filter(u => u.category_id !== undefined)

            if (variantUpdates.length > 0) {
                const res = await bulkUpdateIndividualVariants(variantUpdates.map(u => ({
                    id: u.id,
                    base_price_cents: u.base_price_cents,
                    stock_count: u.stock_count
                })))
                if (res.errorCount > 0) {
                    toast.error(`${res.errorCount} erreurs de variantes`)
                }
            }

            if (categoryUpdates.length > 0) {
                for (const u of categoryUpdates) {
                    await bulkUpdateProductsCategory({
                        mode: 'MANUAL',
                        variantIds: [u.id],
                        newCategoryId: u.category_id!
                    })
                }
            }

            setPendingChanges({})
            toast.success("Changements enregistrés")
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Produits</p>
                        <p className="text-xl font-bold">{initialProducts.length}</p>
                    </div>
                </Card>
                <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Layers size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Variantes Actives</p>
                        <p className="text-xl font-bold">{initialProducts.reduce((acc, p) => acc + p.product_variants.length, 0)}</p>
                    </div>
                </Card>
                <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Critique</p>
                        <p className="text-xl font-bold text-amber-600">
                            {initialProducts.reduce((acc, p) => acc + p.product_variants.filter((v: any) => v.stock_count < 10).length, 0)}
                        </p>
                    </div>
                </Card>
            </div>


            {/* Actions & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Chercher un produit o un SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-light"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" asChild className="h-12 px-6 rounded-xl border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] flex-grow md:flex-initial bg-white hover:bg-slate-50">
                        <Link href="/admin/import">
                            <FileText className="w-4 h-4 mr-2" /> Import CSV
                        </Link>
                    </Button>
                    <Button
                        onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                        className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 font-bold uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shrink-0 flex-grow md:flex-initial"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nouveau Produit
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Card className="bg-slate-900 text-white border-none shadow-2xl px-6 py-4 flex items-center gap-6 rounded-2xl">
                        <div className="flex flex-col border-r border-slate-700 pr-6 mr-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sélectionnés</span>
                            <span className="text-xl font-serif text-accent">{selectionMode === 'ALL_MATCHING' ? 'Tous les résultats' : selectedIds.size}</span>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={() => setIsBulkModalOpen(true)}
                                className="bg-white text-slate-900 hover:bg-slate-100 font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl"
                            >
                                <Edit2 className="w-3 h-3 mr-2" /> Édition Masiva
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-slate-400 hover:text-white hover:bg-slate-800 font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl"
                                onClick={() => {
                                    setSelectedIds(new Set())
                                    setSelectionMode('MANUAL')
                                }}
                            >
                                Annuler
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Table */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto text-[13px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                <th className="pl-6 py-4 w-10">
                                    <Checkbox
                                        checked={selectedIds.size === filteredVariants.length && filteredVariants.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                    />
                                </th>
                                <th className="px-4 py-4">Produit</th>
                                <th className="px-4 py-4">SKU</th>
                                <th className="px-4 py-4">Catégorie</th>
                                <th className="px-4 py-4">Prix (CHF)</th>
                                <th className="px-4 py-4">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredVariants.map((variant) => {
                                const isSelected = selectedIds.has(variant.id)
                                const pending = pendingChanges[variant.id]

                                return (
                                    <tr
                                        key={variant.id}
                                        className={`group hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-accent/5' : ''}`}
                                    >
                                        <td className="pl-6 py-4">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(variant.id)}
                                                className="border-slate-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded border border-slate-100 bg-white flex-shrink-0 overflow-hidden">
                                                    {variant.product_image ? (
                                                        <img src={variant.product_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                            <Package size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{variant.product_name}</span>
                                                    <span className="text-[10px] text-slate-400 font-light italic">
                                                        {Object.values(variant.attributes || {}).join(' / ') || 'Standard'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-mono text-[11px] font-bold text-slate-500">{variant.sku}</td>
                                        <td className="px-4 py-4 min-w-[150px]">
                                            <Select
                                                value={pending?.category_id || variant.category_id || 'none'}
                                                onValueChange={(val) => {
                                                    setPendingChanges(prev => ({
                                                        ...prev,
                                                        [variant.id]: { ...prev[variant.id], category_id: val === 'none' ? undefined : val }
                                                    }))
                                                }}
                                            >
                                                <SelectTrigger className="h-8 text-[11px] border-transparent hover:border-slate-200 bg-transparent transition-all">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-[11px]">Sans catégorie</SelectItem>
                                                    {categories.map(c => (
                                                        <SelectItem key={c.id} value={c.id} className="text-[11px]">{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="relative group/input max-w-[100px]">
                                                <Input
                                                    type="number"
                                                    value={pending?.base_price_cents !== undefined ? (pending.base_price_cents / 100).toFixed(2) : (variant.base_price_cents / 100).toFixed(2)}
                                                    onChange={(e) => {
                                                        const val = Math.round(parseFloat(e.target.value) * 100)
                                                        setPendingChanges(prev => ({
                                                            ...prev,
                                                            [variant.id]: { ...prev[variant.id], base_price_cents: val }
                                                        }))
                                                    }}
                                                    className="h-8 text-xs border-transparent group-hover/input:border-slate-200 focus:border-accent rounded bg-transparent transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="relative group/input max-w-[80px]">
                                                <Input
                                                    type="number"
                                                    value={pending?.stock_count !== undefined ? pending.stock_count : variant.stock_count}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0
                                                        setPendingChanges(prev => ({
                                                            ...prev,
                                                            [variant.id]: { ...prev[variant.id], stock_count: val }
                                                        }))
                                                    }}
                                                    className={`h-8 text-xs border-transparent group-hover/input:border-slate-200 focus:border-accent rounded bg-transparent transition-all font-bold ${variant.stock_count < 10 ? 'text-amber-600' : 'text-slate-900'}`}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredVariants.length === 0 && (
                    <div className="py-24 text-center">
                        <Package size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 text-sm font-light">Aucun résultat.</p>
                    </div>
                )}
            </Card>

            {/* Global Selection Alert */}
            {selectedIds.size === filteredVariants.length && filteredVariants.length > 0 && selectionMode === 'MANUAL' && (
                <div className="bg-accent/5 border border-accent/10 p-3 rounded-xl flex items-center justify-center gap-4 text-xs">
                    <span className="text-slate-600">Vous avez seleccionné las <strong>{filteredVariants.length}</strong> variantes de cette page.</span>
                    <Button
                        variant="link"
                        size="sm"
                        className="text-accent p-0 h-auto font-bold"
                        onClick={selectAllMatching}
                    >
                        Sélectionner tous les résultats correspondant à cette recherche
                    </Button>
                </div>
            )}

            {Object.keys(pendingChanges).length > 0 && (
                <div className="fixed top-24 right-8 z-50 animate-in fade-in zoom-in duration-300">
                    <Card className="bg-white border-2 border-accent shadow-2xl p-4 flex items-center gap-4 rounded-xl">
                        <p className="text-xs font-medium text-slate-600">
                            <span className="text-accent font-bold">{Object.keys(pendingChanges).length}</span> modifications non enregistrées
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-accent hover:bg-accent/90 text-white h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                onClick={handleSavePending}
                                disabled={isSaving}
                            >
                                {isSaving ? "Sauvegarde..." : "Garder"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400"
                                onClick={() => setPendingChanges({})}
                                disabled={isSaving}
                            >
                                Annuler
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {isBulkModalOpen && (
                <BulkEditModal
                    categories={categories}
                    selectedCount={selectionMode === 'ALL_MATCHING' ? -1 : selectedIds.size}
                    onClose={() => setIsBulkModalOpen(false)}
                    onSubmit={async (updates: { base_price_cents?: number; stock_count?: number }) => {
                        setIsSaving(true)
                        try {
                            const res = await bulkUpdateVariants({
                                mode: selectionMode,
                                variantIds: Array.from(selectedIds),
                                excludedIds: Array.from(excludedIds),
                                filter: selectionMode === 'ALL_MATCHING' ? { search } : undefined,
                                updates
                            })

                            if (res.errorCount > 0) {
                                toast.error(`${res.errorCount} erreurs lors de la mise à jour`)
                            } else {
                                toast.success(`${res.successCount} variantes mises à jour`)
                                setSelectedIds(new Set())
                                setSelectionMode('MANUAL')
                            }
                        } catch (e: any) {
                            toast.error(e.message)
                        } finally {
                            setIsSaving(false)
                            setIsBulkModalOpen(false)
                        }
                    }}
                    onCategorySubmit={async (newCategoryId: string) => {
                        setIsSaving(true)
                        try {
                            const res = await bulkUpdateProductsCategory({
                                mode: selectionMode,
                                variantIds: Array.from(selectedIds),
                                excludedIds: Array.from(excludedIds),
                                filter: selectionMode === 'ALL_MATCHING' ? { search } : undefined,
                                newCategoryId
                            })
                            toast.success(`${res.successCount} produits mis à jour`)
                            setSelectedIds(new Set())
                            setSelectionMode('MANUAL')
                        } catch (e: any) {
                            toast.error(e.message)
                        } finally {
                            setIsSaving(false)
                            setIsBulkModalOpen(false)
                        }
                    }}
                />
            )}
        </div>
    )
}
