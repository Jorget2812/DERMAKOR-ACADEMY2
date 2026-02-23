'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, X, Image as ImageIcon, Tag, Package, CreditCard, Truck, Settings } from 'lucide-react'
import { upsertProduct, upsertVariant, deleteVariant } from '../admin-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'

interface InventoryFormProps {
    categories: any[]
    product?: any
    onClose: () => void
}

export function InventoryForm({ categories, product, onClose }: InventoryFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Product Standard Info
    const [name, setName] = useState(product?.name || '')
    const [slug, setSlug] = useState(product?.slug || '')
    const [description, setDescription] = useState(product?.description || '')
    const [categoryId, setCategoryId] = useState(product?.category_id || '')

    // Product Advanced Info
    const [images, setImages] = useState<string[]>(product?.images || ['', '', ''])
    const [type, setType] = useState(product?.type || '')
    const [vendor, setVendor] = useState(product?.vendor || '')
    const [tags, setTags] = useState<string>((product?.tags || []).join(', '))

    // Variants
    const [variants, setVariants] = useState<any[]>(product?.product_variants || [
        {
            sku: '',
            base_price_cents: 0,
            compare_at_price_cents: null,
            cost_per_item_cents: null,
            stock_count: 0,
            barcode: '',
            weight: 0,
            charge_tax: true,
            attributes: {}
        }
    ])
    const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            // Validación de SKUs
            const skus = variants.map(v => v.sku.trim())
            if (skus.some(s => s === '')) {
                throw new Error("Le SKU ne puede être vide para ninguna variante")
            }
            if (new Set(skus).size !== skus.length) {
                throw new Error("Chaque variante doit avoir un SKU unique")
            }

            // 1. Upsert Product
            const productData = {
                id: product?.id,
                name,
                slug: slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                description,
                category_id: categoryId || null,
                images: images.filter(img => img.trim() !== ''),
                type,
                vendor,
                tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
                active: true
            }
            const { data: savedProduct } = await upsertProduct(productData)
            if (!savedProduct) throw new Error("Erreur lors de l'enregistrement du produit")

            // 2. Upsert Variants
            for (const v of variants) {
                await upsertVariant({
                    ...v,
                    sku: v.sku.trim(),
                    product_id: savedProduct.id,
                    active: true
                })
            }

            // 3. Delete Variants that were removed from the UI
            for (const variantId of deletedVariantIds) {
                await deleteVariant(variantId)
            }

            toast.success("Produit et variantes enregistrés avec succès")
            router.refresh()
            onClose()
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    function addVariant() {
        setVariants([...variants, {
            sku: '',
            base_price_cents: 0,
            stock_count: 0,
            charge_tax: true,
            attributes: {}
        }])
    }

    function removeVariant(index: number) {
        const variantToRemove = variants[index]
        if (variantToRemove.id) {
            setDeletedVariantIds([...deletedVariantIds, variantToRemove.id])
        }
        setVariants(variants.filter((_, i) => i !== index))
    }

    function updateVariant(index: number, field: string, value: any) {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        setVariants(newVariants)
    }

    const updateImage = (index: number, url: string) => {
        const newImages = [...images]
        newImages[index] = url
        setImages(newImages)
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-2xl font-serif text-primary">{product ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>
                        <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">Gestion avancée des stocks & Multimedia</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-8 space-y-10">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* MAIN COLUMN */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* TITULO Y DESCRIPCION */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Título</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Camiseta de manga corta"
                                        className="h-12 rounded-xl bg-slate-50/50 border-slate-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Descripción</Label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Escribe los detalles del producto..."
                                        className="flex min-h-[160px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                                    />
                                </div>
                            </section>

                            {/* MULTIMEDIA */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <header className="flex items-center gap-2 text-slate-900">
                                    <ImageIcon size={18} className="text-accent" />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">Multimedia</h3>
                                </header>
                                <div className="grid grid-cols-3 gap-4">
                                    {[0, 1, 2].map((idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
                                                {images[idx] ? (
                                                    <img src={images[idx]} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Button variant="ghost" className="h-full w-full flex flex-col gap-2 text-slate-400">
                                                        <Plus size={20} />
                                                        <span className="text-[10px] font-bold uppercase tracking-tighter">Imagen {idx + 1}</span>
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                placeholder="URL de imagen"
                                                value={images[idx] || ''}
                                                onChange={(e) => updateImage(idx, e.target.value)}
                                                className="h-9 text-[10px] rounded-lg bg-slate-50/50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* PRECIOS & VARIANTES */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                <header className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={18} className="text-blue-500" />
                                        <h3 className="font-bold text-sm uppercase tracking-wider">Variantes & Precios</h3>
                                    </div>
                                    <Button type="button" onClick={addVariant} variant="outline" size="sm" className="rounded-full text-[10px] font-bold uppercase border-slate-200 tracking-widest">
                                        Añadir variante
                                    </Button>
                                </header>

                                <div className="space-y-6">
                                    {variants.map((v, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-6 relative group">
                                            {variants.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 rounded-full h-8 w-8">
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}

                                            <div className="grid grid-cols-4 gap-6">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500">SKU</Label>
                                                    <Input value={v.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} className="h-10 rounded-xl bg-white border-slate-200" required />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500">Precio (CHF)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={v.base_price_cents ? (v.base_price_cents / 100) : ''}
                                                        onChange={(e) => updateVariant(idx, 'base_price_cents', Math.round(parseFloat(e.target.value || "0") * 100))}
                                                        className="h-10 rounded-xl bg-white border-slate-200"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500">Precio Comparación</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={v.compare_at_price_cents ? (v.compare_at_price_cents / 100) : ''}
                                                        onChange={(e) => updateVariant(idx, 'compare_at_price_cents', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                                                        className="h-10 rounded-xl bg-white border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500">Stock</Label>
                                                    <Input type="number" value={v.stock_count} onChange={(e) => updateVariant(idx, 'stock_count', parseInt(e.target.value))} className="h-10 rounded-xl bg-white border-slate-200" required />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200/50">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500">Costo por artículo</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={v.cost_per_item_cents ? (v.cost_per_item_cents / 100) : ''}
                                                        onChange={(e) => updateVariant(idx, 'cost_per_item_cents', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                                                        className="h-10 rounded-xl bg-white border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500">Código de barras</Label>
                                                    <Input value={v.barcode || ''} onChange={(e) => updateVariant(idx, 'barcode', e.target.value)} className="h-10 rounded-xl bg-white border-slate-200" />
                                                </div>
                                                <div className="flex items-center gap-2 pt-6">
                                                    <Checkbox checked={v.charge_tax} onCheckedChange={(val) => updateVariant(idx, 'charge_tax', !!val)} />
                                                    <Label className="text-[11px] font-medium text-slate-600">Cobrar impuesto</Label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="space-y-8">

                            {/* ESTADO */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Estado</Label>
                                <select className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm font-medium">
                                    <option value="ACTIVE">Activo</option>
                                    <option value="DRAFT">Borrador</option>
                                </select>
                            </section>

                            {/* ORGANIZACIÓN */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                <header className="flex items-center gap-2">
                                    <Settings size={18} className="text-slate-400" />
                                    <h3 className="font-bold text-xs uppercase tracking-wider">Organización</h3>
                                </header>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Categoría</Label>
                                        <select
                                            className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Tipo</Label>
                                        <Input value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-slate-200" placeholder="ej: Fillers" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Proveedor</Label>
                                        <Input value={vendor} onChange={(e) => setVendor(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-slate-200" placeholder="KrxAesthetics" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Etiquetas</Label>
                                        <div className="relative">
                                            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <Input value={tags} onChange={(e) => setTags(e.target.value)} className="h-11 pl-10 rounded-xl bg-slate-50 border-slate-200" placeholder="Belleza, Profesional..." />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ENVÍO */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <header className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
                                    <Truck size={17} className="text-slate-400" />
                                    <h3 className="font-bold text-xs uppercase tracking-wider">Envío</h3>
                                </header>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">Peso (kg)</Label>
                                        <Input type="number" step="0.01" className="h-10 rounded-xl bg-slate-50 border-slate-200" placeholder="0.0" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-slate-500">País de origen</Label>
                                        <Input className="h-10 rounded-xl bg-slate-50 border-slate-200" placeholder="Suiza" />
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </form>

                <div className="px-8 py-6 border-t border-slate-200 bg-white flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl h-12 px-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Descartar</Button>
                    <Button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="bg-accent hover:bg-accent/90 text-white rounded-xl h-12 px-12 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20"
                    >
                        {loading ? 'Guardando...' : 'Guardar Producto'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
