'use client'

import { useState } from 'react'
import { ShippingRate, createShippingRate, updateShippingRate } from '../shipping-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ShippingRateFormProps {
    open: boolean
    onClose: () => void
    onSaved: () => void
    initial?: ShippingRate | null
}

export function ShippingRateForm({ open, onClose, onSaved, initial }: ShippingRateFormProps) {
    const [loading, setLoading] = useState(false)
    const [method, setMethod] = useState<'STANDARD' | 'EXPRESS'>(initial?.method || 'STANDARD')
    const [form, setForm] = useState({
        weight_min_kg: ((initial?.weight_min_grams ?? 1) / 1000).toString(),
        weight_max_kg: ((initial?.weight_max_grams ?? 2000) / 1000).toString(),
        price_chf: ((initial?.price_cents ?? 1500) / 100).toFixed(2),
        days_min: (initial?.estimated_days_min ?? 3).toString(),
        days_max: (initial?.estimated_days_max ?? 5).toString(),
        label_fr: initial?.label_fr ?? '',
        label_de: initial?.label_de ?? '',
        label_it: initial?.label_it ?? '',
        active: initial?.active ?? true,
        sort_order: (initial?.sort_order ?? 0).toString(),
    })

    const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value }))

    async function handleSave() {
        setLoading(true)
        try {
            const payload = {
                method,
                label_fr: form.label_fr || (method === 'STANDARD'
                    ? 'Livraison Standard (3-5 jours ouvrables)'
                    : 'Livraison Express (24h)'),
                label_de: form.label_de || null,
                label_it: form.label_it || null,
                weight_min_grams: Math.round(parseFloat(form.weight_min_kg) * 1000),
                weight_max_grams: Math.round(parseFloat(form.weight_max_kg) * 1000),
                price_cents: Math.round(parseFloat(form.price_chf) * 100),
                estimated_days_min: parseInt(form.days_min),
                estimated_days_max: parseInt(form.days_max),
                active: form.active,
                sort_order: parseInt(form.sort_order) || 0,
            }

            if (initial) {
                await updateShippingRate(initial.id, payload)
                toast.success('Tarif mis à jour')
            } else {
                await createShippingRate(payload)
                toast.success('Tarif créé')
            }
            onSaved()
            onClose()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const inputCls = 'h-11 rounded-xl border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent/30 text-sm'
    const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-slate-400'

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg rounded-3xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                        {initial ? 'Modifier le tarif' : 'Nouveau tarif de livraison'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Méthode */}
                    <div className="space-y-2">
                        <Label className={labelCls}>Méthode</Label>
                        <Select value={method} onValueChange={(v) => setMethod(v as any)}>
                            <SelectTrigger className={inputCls}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="STANDARD">📦 Standard (3-5 jours)</SelectItem>
                                <SelectItem value="EXPRESS">⚡ Express (24h)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Poids */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className={labelCls}>Poids min (kg)</Label>
                            <Input value={form.weight_min_kg} onChange={f('weight_min_kg')} type="number" step="0.1" className={inputCls} placeholder="0.1" />
                        </div>
                        <div className="space-y-2">
                            <Label className={labelCls}>Poids max (kg)</Label>
                            <Input value={form.weight_max_kg} onChange={f('weight_max_kg')} type="number" step="0.1" className={inputCls} placeholder="2" />
                        </div>
                    </div>

                    {/* Prix + Délai */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2 col-span-1">
                            <Label className={labelCls}>Prix (CHF)</Label>
                            <Input value={form.price_chf} onChange={f('price_chf')} type="number" step="0.5" className={inputCls} placeholder="15.00" />
                        </div>
                        <div className="space-y-2">
                            <Label className={labelCls}>Délai min (j)</Label>
                            <Input value={form.days_min} onChange={f('days_min')} type="number" className={inputCls} placeholder="3" />
                        </div>
                        <div className="space-y-2">
                            <Label className={labelCls}>Délai max (j)</Label>
                            <Input value={form.days_max} onChange={f('days_max')} type="number" className={inputCls} placeholder="5" />
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label className={labelCls}>Label FR</Label>
                            <Input value={form.label_fr} onChange={f('label_fr')} className={inputCls} placeholder="Livraison Standard (3-5 jours ouvrables)" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className={labelCls}>Label DE (optionnel)</Label>
                                <Input value={form.label_de} onChange={f('label_de')} className={inputCls} placeholder="Standardlieferung..." />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelCls}>Label IT (optionnel)</Label>
                                <Input value={form.label_it} onChange={f('label_it')} className={inputCls} placeholder="Consegna Standard..." />
                            </div>
                        </div>
                    </div>

                    {/* Sort + Active */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="space-y-1">
                            <p className={labelCls}>Ordre d'affichage</p>
                            <Input value={form.sort_order} onChange={f('sort_order')} type="number" className="h-8 w-20 text-sm rounded-lg border-slate-200" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Label className={labelCls}>Actif</Label>
                            <Switch checked={form.active} onCheckedChange={(v) => setForm(p => ({ ...p, active: v }))} />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} className="rounded-xl h-11 text-[11px] uppercase tracking-widest font-bold">
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="rounded-xl h-11 bg-primary text-white hover:bg-black text-[11px] uppercase tracking-widest font-bold">
                        {loading ? 'Enregistrement...' : (initial ? 'Mettre à jour' : 'Créer le tarif')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
