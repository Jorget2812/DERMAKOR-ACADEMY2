'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateProductDetails } from '../product-actions'
import { duplicateProduct, deleteProduct } from '../product-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    ChevronLeft,
    Copy,
    Eye,
    Share2,
    Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from '@/components/ui/star-rating'

// Sub-components
import { DescriptionEditor } from './product-form/DescriptionEditor'
import { MediaManager } from './product-form/MediaManager'
import { PricingCalculator } from './product-form/PricingCalculator'
import { OrgSidebar } from './product-form/OrgSidebar'
import { BadgeEditor } from './BadgeEditor'

const productSchema = z.object({
    name: z.string().min(2, "Le nom doit avoir au menos 2 caracteres"),
    slug: z.string().min(2, "Le slug est obligatoire").regex(/^[a-z0-9-]+$/, "Slug invalide"),
    description: z.string().nullable(),
    category_id: z.string().nullable(),
    status: z.enum(['active', 'draft', 'archived'] as const),
    vendor: z.string(),
    type: z.string(),
    price: z.string(),
    comparePrice: z.string(),
    costPerItem: z.string(),
    tags: z.string(),
    // New fields
    rating: z.number(),
    rating_count: z.number(),
    is_bestseller: z.boolean(),
    badge_text: z.string().nullable(),
    badge_color: z.string(),
    badge_secondary_text: z.string().nullable(),
    show_rating: z.boolean()
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductEditFormProps {
    product: any
    categories: any[]
}

import { Star, StarHalf, Play, X, Check } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
    const [loading, setLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [images, setImages] = useState<string[]>(product.images || [])
    const router = useRouter()

    const primaryVariant = product.product_variants?.[0] || {}

    const { register, handleSubmit, setValue, watch, reset } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            category_id: product.category_id || 'none',
            status: 'active',
            vendor: product.vendor || 'Dermakor Switzerland',
            type: product.type || 'Clinical Treatment',
            price: (primaryVariant.base_price_cents / 100 || 0).toFixed(2),
            comparePrice: (primaryVariant.compare_at_price_cents / 100 || 0).toFixed(2),
            costPerItem: '45.00',
            tags: product.tags?.join(', ') || '',
            rating: Number(product.rating ?? 4.5),
            rating_count: Number(product.rating_count ?? 0),
            is_bestseller: Boolean(product.is_bestseller),
            badge_text: product.badge_text || null,
            badge_color: product.badge_color || '#C0A76A',
            badge_secondary_text: product.badge_secondary_text || null,
            show_rating: product.show_rating ?? true
        }
    })

    const nameValue = watch('name')
    const priceValue = watch('price')
    const costValue = watch('costPerItem')
    const categoryValue = watch('category_id')
    const ratingValue = watch('rating')
    const badgeTextValue = watch('badge_text')
    const badgeColorValue = watch('badge_color')
    const isBestsellerValue = watch('is_bestseller')

    const marginData = useMemo(() => {
        const p = parseFloat(priceValue || '0')
        const c = parseFloat(costValue || '0')
        if (!p || p === 0) return { margin: '0%', profit: '0.00' }
        const profit = p - c
        const margin = (profit / p) * 100
        return {
            margin: `${Math.round(margin)}%`,
            profit: profit.toFixed(2)
        }
    }, [priceValue, costValue])

    async function onSubmit(values: ProductFormValues) {
        setLoading(true)
        try {
            await updateProductDetails(product.id, {
                ...values,
                category_id: values.category_id === 'none' ? null : values.category_id,
                images: images,
                tags: values.tags ? values.tags.split(',').map(t => t.trim()) : []
            })
            toast.success("Changes saved successfully")
            router.push('/admin/products')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deleteProduct(product.id)
            toast.success("Produit supprimé avec succès")
            router.push('/admin/products')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
            setDeleteDialogOpen(false)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDuplicate = async () => {
        const promise = duplicateProduct(product.id)
        toast.promise(promise, {
            loading: 'Duplication en cours...',
            success: (data) => {
                router.push(`/admin/products/${data.id}`)
                return 'Produit dupliqué avec succès'
            },
            error: (err) => err.message
        })
    }

    const handleView = () => {
        window.open(`/shop/${product.slug}`, '_blank')
    }

    const handleShare = () => {
        const url = `${window.location.origin}/shop/${product.slug}`
        navigator.clipboard.writeText(url)
        toast.success("Lien copié dans le presse-papier")
    }

    return (
        <div className="flex flex-col h-screen bg-[#F6F6F6] overflow-hidden">
            {/* Header: Compact & Action-Oriented */}
            <header className="px-8 h-20 border-b border-[#EEEEEE] bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="p-2 hover:bg-[#F6F6F6] rounded-xl transition-colors"
                    >
                        <ChevronLeft size={20} className="text-primary/40" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-serif text-[#1A1A1A]">{nameValue}</h1>
                            <Badge className="bg-[#E7F7F0] text-[#008A52] border-none px-2 h-5 rounded-full text-[9px] font-bold uppercase tracking-wide">
                                Active
                            </Badge>
                        </div>
                        <span className="text-[10px] text-primary/20 font-mono uppercase tracking-widest">{product.slug}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 border-r border-[#EEEEEE] pr-4 mr-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDuplicate}
                            className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/40 gap-2 hover:bg-[#F6F6F6]"
                        >
                            <Copy size={14} /> Duplicate
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleView}
                            className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/40 gap-2 hover:bg-[#F6F6F6]"
                        >
                            <Eye size={14} /> View
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/40 gap-2 hover:bg-[#F6F6F6]"
                        >
                            <Share2 size={14} /> Share
                        </Button>
                    </div>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        className="h-10 px-6 rounded-xl bg-[#1A1A1A] text-white hover:bg-black transition-all shadow-lg shadow-black/10 font-bold text-[11px] uppercase tracking-widest"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </header>

            {/* Main Application: 3 Column High-Density Grid */}
            <main className="flex-grow p-6 overflow-hidden">
                <div className="grid grid-cols-12 gap-6 h-full max-w-[1920px] mx-auto">

                    {/* Column 1: Core Details */}
                    <div className="col-span-4 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
                        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 space-y-4 shadow-sm">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Product Title</label>
                            <Input
                                {...register('name')}
                                className="h-12 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-accent/20"
                                placeholder="Enter product name..."
                            />
                        </div>
                        <DescriptionEditor register={register} watch={watch} />

                        {/* DELETE ACTION */}
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/5 rounded-2xl h-12 font-bold uppercase tracking-[0.15em] text-[10px] gap-2 border border-destructive/10 mt-auto">
                                    <Trash2 size={16} /> Delete Product
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl border-none shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="font-serif text-2xl">Supprimer ce produit ?</DialogTitle>
                                    <DialogDescription className="py-4">
                                        Êtes-vous sûr de vouloir supprimer <span className="font-bold text-primary">{nameValue}</span> ?
                                        Esta acción es irreversible.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2">
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl h-12 uppercase text-[10px] tracking-widest font-bold">Annuler</Button>
                                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl h-12 uppercase text-[10px] tracking-widest font-bold">
                                        {isDeleting ? "Suppression..." : "Confirmer la suppression"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Column 2: Content Tabs */}
                    <div className="col-span-4 flex flex-col h-full overflow-hidden pb-6">
                        <Tabs defaultValue="general" className="flex flex-col h-full">
                            <TabsList className="bg-white border border-[#EEEEEE] p-1 rounded-2xl h-12 shrink-0 mb-6 shadow-sm">
                                <TabsTrigger value="general" className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                                    Général & Prix
                                </TabsTrigger>
                                <TabsTrigger value="marketing" className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                                    Marketing & Badges
                                </TabsTrigger>
                                <TabsTrigger value="ratings" className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                                    Evaluations
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="flex-grow overflow-y-auto no-scrollbar space-y-6 focus-visible:ring-0">
                                <MediaManager images={images} onChange={setImages} />
                                <PricingCalculator register={register} marginData={marginData} />
                            </TabsContent>

                            <TabsContent value="marketing" className="flex-grow overflow-y-auto no-scrollbar focus-visible:ring-0 space-y-6">
                                {/* BADGES & AFFICHAGE */}
                                <div className="bg-white rounded-3xl border border-[#EEEEEE] p-8 space-y-8 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-accent" />
                                            Badges & Affichage
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Badge Principal</label>
                                            <div className="flex gap-2">
                                                <Select onValueChange={(val) => setValue('badge_text', val === 'clear' ? null : val)} defaultValue={badgeTextValue || ''}>
                                                    <SelectTrigger className="h-12 rounded-xl border-[#EEEEEE]">
                                                        <SelectValue placeholder="Sélectionner un badge" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-[#EEEEEE] shadow-xl">
                                                        <SelectItem value="clear">Sans badge</SelectItem>
                                                        <SelectItem value="Tarif Pro">Tarif Pro</SelectItem>
                                                        <SelectItem value="Bestseller">Bestseller</SelectItem>
                                                        <SelectItem value="Nouveau">Nouveau</SelectItem>
                                                        <SelectItem value="Exclusif">Exclusif</SelectItem>
                                                        <SelectItem value="Plus demandé">Plus demandé</SelectItem>
                                                        <SelectItem value="Édition limitée">Édition limitée</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    value={badgeTextValue || ''}
                                                    onChange={(e) => setValue('badge_text', e.target.value)}
                                                    className="h-12 rounded-xl border-[#EEEEEE]"
                                                    placeholder="Ou texte personnalisé..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Couleur du Badge</label>
                                            <div className="flex gap-3">
                                                {[
                                                    { name: 'Dorado', color: '#C0A76A' },
                                                    { name: 'Noir', color: '#1e1e1e' },
                                                    { name: 'Vert', color: '#2D5A3D' }
                                                ].map((c) => (
                                                    <button
                                                        key={c.color}
                                                        type="button"
                                                        onClick={() => setValue('badge_color', c.color)}
                                                        className={cn(
                                                            "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 border transition-all",
                                                            badgeColorValue === c.color ? "border-primary ring-4 ring-primary/5 font-bold" : "border-[#EEEEEE] opacity-50 hover:opacity-100"
                                                        )}
                                                    >
                                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                                                        <span className="text-[10px] uppercase tracking-wider">{c.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Badge Secondaire (Optionnel)</label>
                                            <Input
                                                {...register('badge_secondary_text')}
                                                className="h-12 rounded-xl border-[#EEEEEE]"
                                                placeholder="Nouveau, Stock Limité, etc."
                                            />
                                        </div>

                                        {/* CSS PREVIEW BADGE */}
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Aperçu du badge</span>
                                            <div className="flex gap-2">
                                                {badgeTextValue && (
                                                    <div
                                                        className="px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase font-oswald tracking-widest shadow-lg"
                                                        style={{ backgroundColor: badgeColorValue }}
                                                    >
                                                        {badgeTextValue}
                                                    </div>
                                                )}
                                                {isBestsellerValue && (
                                                    <div className="px-4 py-1.5 rounded-full text-[10px] font-bold border border-[#C0A76A] text-[#C0A76A] uppercase font-oswald tracking-widest">
                                                        Bestseller
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="ratings" className="flex-grow overflow-y-auto no-scrollbar focus-visible:ring-0 space-y-6">
                                {/* ÉVALUATIONS & POPULARITÉ */}
                                <div className="bg-white rounded-3xl border border-[#EEEEEE] p-8 space-y-8 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-accent" />
                                            Évaluations & Popularité
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <Label htmlFor="show_rating" className="text-[10px] font-bold uppercase text-primary/40">Afficher étoiles</Label>
                                            <Switch
                                                id="show_rating"
                                                checked={watch('show_rating')}
                                                onCheckedChange={(val) => setValue('show_rating', val)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40 flex justify-between">
                                                Note du produit
                                                <span className="text-primary font-serif italic text-lg">{ratingValue}/5</span>
                                            </label>

                                            {/* Interactive Stars */}
                                            <div className="flex gap-2 p-8 bg-slate-50 rounded-3xl justify-center items-center shadow-inner border border-slate-200/50">
                                                <StarRating
                                                    rating={ratingValue}
                                                    interactive={true}
                                                    size="lg"
                                                    showCount={false}
                                                    onRatingChange={(val) => setValue('rating', val)}
                                                />
                                            </div>
                                            <p className="text-center text-[9px] uppercase tracking-[0.1em] font-bold text-slate-400">Cliquez sur une étoile pour définir la note (supporte les demi-étoiles)</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Nombre d'avis</label>
                                                <Input
                                                    type="number"
                                                    {...register('rating_count', { valueAsNumber: true })}
                                                    className="h-12 rounded-xl border-[#EEEEEE] font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Status Bestseller</label>
                                                <div className="h-12 flex items-center justify-between px-4 bg-secondary/20 rounded-xl border border-secondary transition-all hover:bg-white">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Activer Badge</span>
                                                    <Switch
                                                        checked={isBestsellerValue}
                                                        onCheckedChange={(val) => setValue('is_bestseller', val)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 border border-slate-100 bg-[#FDFCFB] rounded-[32px] text-center space-y-6 shadow-sm">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aperçu Réel Boutique</span>
                                            <div className="flex flex-col items-center gap-3">
                                                {watch('show_rating') && (
                                                    <StarRating
                                                        rating={ratingValue}
                                                        count={watch('rating_count')}
                                                        size="md"
                                                    />
                                                )}
                                                {isBestsellerValue && (
                                                    <span className="text-[10px] font-bold text-[#C0A76A] uppercase tracking-[0.1em] font-oswald border border-[#C0A76A] px-3 py-1 rounded-[2px] bg-transparent mt-2">
                                                        Bestseller
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Column 3: Organization & Status */}
                    <div className="col-span-4 h-full overflow-hidden">
                        <OrgSidebar
                            register={register}
                            setValue={setValue}
                            categories={categories}
                            categoryValue={categoryValue}
                        />
                    </div>

                </div>
            </main>
        </div>
    )
}
