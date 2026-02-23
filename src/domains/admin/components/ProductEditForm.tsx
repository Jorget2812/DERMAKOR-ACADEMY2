'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateProductDetails } from '../product-actions'
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

// Sub-components
import { DescriptionEditor } from './product-form/DescriptionEditor'
import { MediaManager } from './product-form/MediaManager'
import { PricingCalculator } from './product-form/PricingCalculator'
import { OrgSidebar } from './product-form/OrgSidebar'
import { BadgeEditor } from './BadgeEditor'

const productSchema = z.object({
    name: z.string().min(2, "Le nom doit avoir au moins 2 caracteres"),
    slug: z.string().min(2, "Le slug est obligatoire").regex(/^[a-z0-9-]+$/, "Slug invalide"),
    description: z.string().nullable(),
    category_id: z.string().nullable(),
    status: z.enum(['active', 'draft', 'archived'] as const),
    vendor: z.string().optional(),
    type: z.string().optional(),
    price: z.string().optional(),
    comparePrice: z.string().optional(),
    costPerItem: z.string().optional(),
    tags: z.string().optional()
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductEditFormProps {
    product: any
    categories: any[]
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<string[]>(product.images || [])
    const router = useRouter()

    const primaryVariant = product.product_variants?.[0] || {}

    const { register, handleSubmit, setValue, watch } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            category_id: product.category_id || 'none',
            status: 'active',
            vendor: product.vendor || 'Dermakor Switzerland',
            type: product.type || 'Clinical Treatment',
            price: (primaryVariant.base_price_cents / 100 || 0).toFixed(2),
            comparePrice: (primaryVariant.compare_at_price_cents / 100 || 0).toFixed(2),
            costPerItem: '45.00',
            tags: product.tags?.join(', ') || ''
        }
    })

    const nameValue = watch('name')
    const priceValue = watch('price')
    const costValue = watch('costPerItem')
    const categoryValue = watch('category_id')

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
                        <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/40 gap-2 hover:bg-[#F6F6F6]">
                            <Copy size={14} /> Duplicate
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/40 gap-2 hover:bg-[#F6F6F6]">
                            <Eye size={14} /> View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary/40 gap-2 hover:bg-[#F6F6F6]">
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
                        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Product Title</label>
                            <Input
                                {...register('name')}
                                className="h-12 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-accent/20"
                                placeholder="Enter product name..."
                            />
                        </div>
                        <DescriptionEditor register={register} watch={watch} />
                        <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/5 rounded-2xl h-12 font-bold uppercase tracking-[0.15em] text-[10px] gap-2 border border-destructive/10 mt-auto">
                            <Trash2 size={16} /> Delete Product
                        </Button>
                    </div>

                    {/* Column 2: Content Tabs */}
                    <div className="col-span-4 flex flex-col h-full overflow-hidden pb-6">
                        <Tabs defaultValue="general" className="flex flex-col h-full">
                            <TabsList className="bg-white border border-[#EEEEEE] p-1 rounded-2xl h-12 shrink-0 mb-6">
                                <TabsTrigger value="general" className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-primary">
                                    Général & Prix
                                </TabsTrigger>
                                <TabsTrigger value="marketing" className="flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-primary">
                                    Marketing & Badges
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="flex-grow overflow-y-auto no-scrollbar space-y-6 focus-visible:ring-0">
                                <MediaManager images={images} onChange={setImages} />
                                <PricingCalculator register={register} marginData={marginData} />
                            </TabsContent>

                            <TabsContent value="marketing" className="flex-grow overflow-y-auto no-scrollbar focus-visible:ring-0">
                                <BadgeEditor productId={product.id} />
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
