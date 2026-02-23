'use client'

import { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PricingScope, upsertPricingRule } from '@/domains/admin/pricing-pro-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface PricingRuleFormProps {
    categories: { id: string, name: string }[]
    products: { id: string, name: string }[]
    defaultMonth: string
}

export default function PricingRuleForm({ categories, products, defaultMonth }: PricingRuleFormProps) {
    const [isPending, startTransition] = useTransition()
    const [scope, setScope] = useState<PricingScope>('GLOBAL')
    const [level, setLevel] = useState<'STANDARD' | 'PREMIUM'>('PREMIUM')

    async function handleSubmit(formData: FormData) {
        const factor = parseFloat(formData.get('factor') as string)
        const month = formData.get('month') as string
        const targetId = formData.get('targetId') as string

        startTransition(async () => {
            try {
                await upsertPricingRule({
                    year_month: month,
                    level,
                    scope,
                    category_id: scope === 'CATEGORY' ? targetId : null,
                    product_id: scope === 'PRODUCT' ? targetId : null,
                    resale_factor: factor,
                    active: true
                })
                toast.success("Règle ajoutée avec succès")
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mois</label>
                <Input type="month" name="month" defaultValue={defaultMonth} required className="bg-slate-50 border-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nivel</label>
                    <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                        <SelectTrigger className="bg-slate-50 border-slate-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STANDARD">Standard</SelectItem>
                            <SelectItem value="PREMIUM">Premium</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Portée (Scope)</label>
                    <Select value={scope} onValueChange={(v: any) => setScope(v)}>
                        <SelectTrigger className="bg-slate-50 border-slate-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GLOBAL">Global</SelectItem>
                            <SelectItem value="CATEGORY">Catégorie</SelectItem>
                            <SelectItem value="PRODUCT">Produit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {scope !== 'GLOBAL' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {scope === 'CATEGORY' ? 'Sélectionner Catégorie' : 'Sélectionner Produit'}
                    </label>
                    <Select name="targetId" required>
                        <SelectTrigger className="bg-slate-50 border-slate-100">
                            <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                            {scope === 'CATEGORY' ? (
                                categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                            ) : (
                                products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Facteur de Revente</label>
                <Input
                    type="number"
                    name="factor"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="e.g. 2.0"
                    required
                    className="bg-slate-50 border-slate-100 h-12 text-lg font-bold"
                />
                <p className="text-[10px] text-muted-foreground italic">Entre 1.0 (pas de marge) et 5.0</p>
            </div>

            <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-accent/20"
            >
                {isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : 'Créer la Règle'}
            </Button>
        </form>
    )
}
