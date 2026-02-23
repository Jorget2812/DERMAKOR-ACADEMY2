'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { previewPricing } from '../pricing-pro-actions'
import { Calculator, Zap, ArrowRight, Info } from 'lucide-react'
import { toast } from 'sonner'

interface PricingPreviewToolProps {
    products: { id: string, name: string }[]
    currentMonth: string
}

export default function PricingPreviewTool({ products, currentMonth }: PricingPreviewToolProps) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [productId, setProductId] = useState<string>('')
    const [level, setLevel] = useState<'STANDARD' | 'PREMIUM'>('PREMIUM')

    async function handlePreview() {
        if (!productId) return toast.error("Sélectionnez un produit")

        setLoading(true)
        try {
            const data = await previewPricing(productId, currentMonth, level)
            setResult(data)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Produit à tester</label>
                    <Select value={productId} onValueChange={setProductId}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                            <SelectValue placeholder="Choisir un produit..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Niveau Partenaire</label>
                    <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="STANDARD">Standard</SelectItem>
                            <SelectItem value="PREMIUM">Premium</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handlePreview}
                    disabled={loading || !productId}
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold uppercase tracking-widest text-[10px] h-11"
                >
                    {loading ? 'Calcul...' : 'Simuler le prix'}
                    <Calculator size={14} className="ml-2" />
                </Button>
            </div>

            {result && (
                <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Résultat</span>
                        <Zap size={14} className="text-amber-400 fill-amber-400" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-white/60 font-light">Prix Retail (HT)</span>
                            <span className="text-sm font-medium line-through decoration-white/20 text-white/30">
                                CHF {(result.basePrice / 100).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-y border-white/5">
                            <div className="flex items-center gap-2">
                                <ArrowRight size={12} className="text-accent" />
                                <span className="text-xs font-bold text-accent uppercase tracking-widest">Facteur Appliqué</span>
                            </div>
                            <span className="text-sm font-black text-white">{result.factorUsed.toFixed(1)}x</span>
                        </div>

                        <div className="flex justify-between items-end pt-1">
                            <span className="text-xs text-white/60 font-light">Prix Pro Net</span>
                            <span className="text-xl font-serif text-white">
                                CHF {(result.netPrice / 100).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/40 italic">TVA ({level === 'STANDARD' ? '0%' : '0%'})</span>
                            <span className="text-white/40">CHF 0.00</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-start gap-2">
                        <Info size={12} className="text-white/20 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-white/30 leading-relaxed italic">
                            Les membres {level} ne paient pas de TVA selon les règles professionnelles.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
