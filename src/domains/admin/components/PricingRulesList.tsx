'use client'

import { useTransition } from 'react'
import { Trash2, Globe, Tag, Box, CheckCircle2, XCircle } from 'lucide-react'
import { PricingRule, deletePricingRule } from '../pricing-pro-actions'
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'

interface PricingRulesListProps {
    rules: any[]
}

export default function PricingRulesList({ rules }: PricingRulesListProps) {
    const [isPending, startTransition] = useTransition()

    if (!rules || rules.length === 0) {
        return (
            <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Settings2 size={24} />
                </div>
                <p className="text-sm text-slate-400 font-light italic">Aucune règle définie pour cette période.</p>
            </div>
        )
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cette règle ?")) return

        startTransition(async () => {
            try {
                await deletePricingRule(id)
                toast.success("Règle supprimée")
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Niveau</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Portée</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cible</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Facteur</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</th>
                        <th className="p-4 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {rules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="p-4 text-xs font-bold">
                                {rule.level === 'PREMIUM' ? (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-5">PREMIUM</Badge>
                                ) : (
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0 h-5">STANDARD</Badge>
                                )}
                            </td>
                            <td className="p-4 text-xs">
                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    {rule.scope === 'GLOBAL' && <Globe size={14} className="text-slate-400" />}
                                    {rule.scope === 'CATEGORY' && <Tag size={14} className="text-slate-400" />}
                                    {rule.scope === 'PRODUCT' && <Box size={14} className="text-slate-400" />}
                                    {rule.scope}
                                </div>
                            </td>
                            <td className="p-4 text-xs">
                                {rule.scope === 'GLOBAL' ? (
                                    <span className="text-slate-400 italic">Tout le catalogue</span>
                                ) : (
                                    <span className="font-medium text-slate-700 truncate max-w-[150px] inline-block">
                                        {rule.categories?.name || rule.products?.name || 'Inconnue'}
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                <span className="text-sm font-black text-primary bg-primary/5 px-2 py-1 rounded-md">
                                    {Number(rule.resale_factor).toFixed(1)}x
                                </span>
                            </td>
                            <td className="p-4 text-xs">
                                {rule.active ? (
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase tracking-wider text-[9px]">
                                        <CheckCircle2 size={12} /> ACTIF
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-rose-500 font-bold uppercase tracking-wider text-[9px]">
                                        <XCircle size={12} /> INACTIF
                                    </div>
                                )}
                            </td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => handleDelete(rule.id)}
                                    disabled={isPending}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

import { Settings2 } from 'lucide-react'
