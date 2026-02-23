'use client'

import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Search, Plus, ExternalLink } from 'lucide-react'

interface OrgSidebarProps {
    register: UseFormRegister<any>
    setValue: UseFormSetValue<any>
    categories: any[]
    categoryValue: string | null
}

export function OrgSidebar({ register, setValue, categories, categoryValue }: OrgSidebarProps) {
    return (
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 space-y-8 overflow-y-auto no-scrollbar h-full">
            {/* Status & Publishing */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Status</h3>
                    <Badge className="bg-[#E7F7F0] text-[#008A52] border-none px-2 h-5 rounded-full text-[9px] font-bold tracking-wide">
                        Active
                    </Badge>
                </div>
                <Select defaultValue="active">
                    <SelectTrigger className="h-10 rounded-xl border-[#EEEEEE] bg-[#FDFCFB] text-xs px-4">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-3xl border-none">
                        <SelectItem value="active" className="text-xs">Active</SelectItem>
                        <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                        <SelectItem value="archived" className="text-xs text-destructive">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full h-px bg-[#F6F6F6]" />

            {/* Organization */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Organization</h3>

                <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20 ml-1">Category</Label>
                    <Select value={categoryValue || 'none'} onValueChange={val => setValue('category_id', val)}>
                        <SelectTrigger className="h-10 rounded-xl bg-[#FDFCFB] border-[#EEEEEE] text-[11px] px-4">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-3xl">
                            <SelectItem value="none" className="text-xs">Uncategorized</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20 ml-1">Type</Label>
                    <Input {...register('type')} placeholder="Product Type" className="h-10 rounded-xl bg-[#FDFCFB] border-[#EEEEEE] px-4 text-[11px]" />
                </div>

                <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20 ml-1">Vendor</Label>
                    <Input {...register('vendor')} placeholder="Vendor Name" className="h-10 rounded-xl bg-[#FDFCFB] border-[#EEEEEE] px-4 text-[11px]" />
                </div>

                <div className="space-y-3">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/20 ml-1">Tags</Label>
                    <Input {...register('tags')} placeholder="Vintage, Gold..." className="h-10 rounded-xl bg-[#FDFCFB] border-[#EEEEEE] px-4 text-[11px]" />
                </div>
            </div>

            <div className="w-full h-px bg-[#F6F6F6]" />

            {/* Publishing Channels */}
            <div className="space-y-5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/40">Publishing</h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#FDFCFB] rounded-xl border border-[#F6F6F6]">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#008A52]" />
                            <span className="text-[11px] font-medium text-[#1A1A1A]">Online Store</span>
                        </div>
                        <ExternalLink size={12} className="text-primary/10" />
                    </div>
                </div>
            </div>
        </div>
    )
}
