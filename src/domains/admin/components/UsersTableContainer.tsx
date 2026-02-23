'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Award, MoreVertical, ShieldCheck } from 'lucide-react'
import { updateUserProfile } from '../admin-actions'
import { toast } from 'sonner'

interface Profile {
    id: string
    full_name: string
    company_name: string | null
    email: string
    level: 'NONE' | 'STANDARD' | 'PREMIUM'
    status: 'ACTIVE' | 'SUSPENDED'
    locale: string | null
    created_at: string | null
}

export function UsersTableContainer({ initialProfiles }: { initialProfiles: Profile[] }) {
    const [profiles, setProfiles] = useState(initialProfiles)
    const [search, setSearch] = useState('')

    const filtered = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
    )

    async function handleUpdate(id: string, data: any) {
        try {
            await updateUserProfile(id, data)
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
            toast.success("Mise à jour réussie")
        } catch (e: any) {
            toast.error("Erreur lors de la mise à jour")
        }
    }

    async function handleUpgrade(id: string, currentLevel: string) {
        const nextLevel = currentLevel === 'STANDARD' ? 'PREMIUM' : 'STANDARD'
        await handleUpdate(id, { level: nextLevel })
    }

    async function handleStatusToggle(id: string, currentStatus: string) {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
        await handleUpdate(id, { status: newStatus })
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Rechercher par nom, email ou entreprise..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-light"
                />
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <th className="px-6 py-4">Partenaire</th>
                                <th className="px-6 py-4">Niveau</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Locale</th>
                                <th className="px-6 py-4">Inscrit le</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((profile) => (
                                <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-accent font-bold text-xs border border-accent/10">
                                                {profile.full_name?.[0] || '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{profile.full_name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{profile.company_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <LevelBadge level={profile.level} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge
                                            className={profile.status === 'ACTIVE' ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer border-none" : "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer border-none"}
                                            onClick={() => handleStatusToggle(profile.id, profile.status)}
                                        >
                                            {profile.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 uppercase text-[10px] font-bold text-slate-400">
                                        {profile.locale || 'fr'}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-500 font-light">
                                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-CH') : 'N/A'}
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-accent hover:text-accent hover:bg-accent/5"
                                                onClick={() => handleUpgrade(profile.id, profile.level)}
                                            >
                                                <Award className="w-4 h-4 mr-1" /> {profile.level === 'STANDARD' ? 'Upgrade' : 'Downgrade'}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground italic text-sm">
                            Aucun professionnel trouvé.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

function LevelBadge({ level }: { level: string | null }) {
    if (level === 'PREMIUM') return <Badge className="bg-amber-100 text-amber-900 border border-amber-200/50 flex items-center gap-1 w-fit uppercase text-[9px] px-2"><ShieldCheck size={10} className="text-amber-600" /> PREMIUM</Badge>
    if (level === 'STANDARD') return <Badge className="bg-blue-100 text-blue-900 border border-blue-200/50 flex items-center gap-1 w-fit uppercase text-[9px] px-2">STANDARD</Badge>
    return <Badge variant="outline" className="text-slate-400 uppercase text-[9px] px-2 font-light">AUCUN</Badge>
}
