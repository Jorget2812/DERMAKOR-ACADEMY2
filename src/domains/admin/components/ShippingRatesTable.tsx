'use client'

import { useState, useTransition } from 'react'
import { ShippingRate, deleteShippingRate, toggleShippingRate } from '../shipping-actions'
import { ShippingRateForm } from './ShippingRateForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Plus, Truck, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ShippingRatesTableProps {
    rates: ShippingRate[]
}

export function ShippingRatesTable({ rates: initialRates }: ShippingRatesTableProps) {
    const [rates, setRates] = useState(initialRates)
    const [editing, setEditing] = useState<ShippingRate | null>(null)
    const [creating, setCreating] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    function refresh() {
        router.refresh()
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer ce tarif ?')) return
        try {
            await deleteShippingRate(id)
            setRates(prev => prev.filter(r => r.id !== id))
            toast.success('Tarif supprimé')
            refresh()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    async function handleToggle(id: string, active: boolean) {
        // Optimistic update — flip immediately so Switch reacts at once
        setRates(prev => prev.map(r => r.id === id ? { ...r, active } : r))
        try {
            await toggleShippingRate(id, active)
            refresh()
        } catch (err: any) {
            // Revert on error
            setRates(prev => prev.map(r => r.id === id ? { ...r, active: !active } : r))
            toast.error(err.message)
        }
    }

    const fmtCHF = (cents: number) => (cents / 100).toFixed(2)
    const fmtKg = (g: number) => (g / 1000).toFixed(1)

    const standard = rates.filter(r => r.method === 'STANDARD').sort((a, b) => a.sort_order - b.sort_order)
    const express = rates.filter(r => r.method === 'EXPRESS').sort((a, b) => a.sort_order - b.sort_order)

    const RateRow = ({ rate }: { rate: ShippingRate }) => (
        <tr className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
            <td className="px-6 py-4">
                <span className="text-xs text-slate-500 font-mono">
                    {fmtKg(rate.weight_min_grams)} — {fmtKg(rate.weight_max_grams)} kg
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="font-bold text-primary text-sm">CHF {fmtCHF(rate.price_cents)}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-xs text-slate-500">
                    {rate.estimated_days_min === rate.estimated_days_max
                        ? `${rate.estimated_days_min} j`
                        : `${rate.estimated_days_min}–${rate.estimated_days_max} j`}
                </span>
            </td>
            <td className="px-6 py-4">
                <Switch
                    checked={rate.active}
                    onCheckedChange={(v) => handleToggle(rate.id, v)}
                    className="data-[state=checked]:bg-accent"
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setEditing(rate)}
                        className="p-1.5 rounded-lg hover:bg-accent/10 text-accent transition-colors"
                    >
                        <Pencil size={13} />
                    </button>
                    <button
                        onClick={() => handleDelete(rate.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </tr>
    )

    const SectionHeader = ({ method, label, icon }: { method: string, label: string, icon: React.ReactNode }) => (
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${method === 'STANDARD' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">{label}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                    {method === 'STANDARD' ? '3-5 jours ouvrables' : 'Livraison en 24 heures'}
                </p>
            </div>
        </div>
    )

    const RateTable = ({ rates, method }: { rates: ShippingRate[], method: string }) => (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Plage de poids</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Prix CHF</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Délai</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Actif</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rates.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm italic">Aucun tarif configuré</td></tr>
                    ) : (
                        rates.map(rate => <RateRow key={rate.id} rate={rate} />)
                    )}
                </tbody>
            </table>
        </div>
    )

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-primary">Tarifs de Livraison</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-light">
                        Configurez les tarifs par poids. La TVA ne s'applique pas au frais de livraison.
                    </p>
                </div>
                <Button
                    onClick={() => setCreating(true)}
                    className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-black text-[11px] uppercase tracking-widest font-bold gap-2"
                >
                    <Plus size={14} /> Nouveau tarif
                </Button>
            </div>

            <div className="space-y-8">
                <div>
                    <SectionHeader method="STANDARD" label="Livraison Standard" icon={<Truck size={16} />} />
                    <RateTable rates={standard} method="STANDARD" />
                </div>
                <div>
                    <SectionHeader method="EXPRESS" label="Livraison Express" icon={<Zap size={16} />} />
                    <RateTable rates={express} method="EXPRESS" />
                </div>
            </div>

            {/* Summary card */}
            <div className="mt-8 p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">💡 Règle de calcul</p>
                <p className="text-[11px] text-amber-600 leading-relaxed">
                    Le poids total du panier détermine le tarif. Si un produit n'a pas de poids configuré, il compte 0g.
                    La livraison est facturée au coût et est <strong>exonérée de TVA</strong> en Suisse.
                    <br />
                    Formule: <code className="bg-amber-100 px-1 rounded">TOTAL = Sous-total HT + TVA 8.1% + Livraison</code>
                </p>
            </div>

            {/* Modals */}
            <ShippingRateForm
                open={creating}
                onClose={() => setCreating(false)}
                onSaved={refresh}
            />
            {editing && (
                <ShippingRateForm
                    open={true}
                    initial={editing}
                    onClose={() => setEditing(null)}
                    onSaved={refresh}
                />
            )}
        </>
    )
}
