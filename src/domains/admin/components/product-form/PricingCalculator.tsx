'use client'

import { UseFormRegister } from 'react-hook-form'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { HelpCircle } from 'lucide-react'

interface PricingCalculatorProps {
    register: UseFormRegister<any>
    marginData: {
        margin: string
        profit: string
    }
}

export function PricingCalculator({ register, marginData }: PricingCalculatorProps) {
    return (
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20 ml-1">Price</Label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-bold font-mono text-primary/20">CHF</div>
                        <Input {...register('price')} className="h-11 pl-11 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl text-sm font-medium" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20">Compare</Label>
                        <HelpCircle size={12} className="text-primary/10" />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-bold font-mono text-primary/20">CHF</div>
                        <Input {...register('comparePrice')} className="h-11 pl-11 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl text-sm font-medium" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F6F6F6]">
                <div className="flex-grow flex gap-8">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/20 mb-1">Margin</p>
                        <p className="text-lg text-[#333] font-light">{marginData.margin}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/20 mb-1">Profit</p>
                        <p className="text-lg text-[#1A1A1A] font-medium">
                            <span className="text-[9px] font-mono text-primary/20 mr-1">CHF</span>
                            {marginData.profit}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20 ml-1">Cost per item</Label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-bold font-mono text-primary/20">CHF</div>
                    <Input {...register('costPerItem')} className="h-11 pl-11 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl text-sm font-medium" />
                </div>
            </div>

            {/* Weight */}
            <div className="space-y-2 pt-4 border-t border-[#F6F6F6]">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20 ml-1">Poids (g)</Label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-bold font-mono text-primary/20">g</div>
                    <Input
                        {...register('weight_grams', { valueAsNumber: true })}
                        type="number"
                        min={0}
                        max={30000}
                        step={1}
                        className="h-11 pl-8 bg-[#FDFCFB] border-[#EEEEEE] rounded-xl text-sm font-medium"
                        placeholder="250"
                    />
                </div>
                <p className="text-[9px] text-primary/20 ml-1">Utilisé pour calculer les frais de livraison</p>
            </div>
        </div>
    )
}
