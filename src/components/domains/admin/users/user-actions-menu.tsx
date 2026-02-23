'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Shield, ToggleLeft, Languages, User } from 'lucide-react'
import { updateUserProfile } from '@/domains/admin/user-actions'
import { toast } from 'sonner'

export function UserActionsMenu({ user }: { user: any }) {
    async function handleUpdate(updates: any) {
        try {
            await updateUserProfile(user.id, updates)
            toast.success("Profil utilisateur mis à jour.")
        } catch (e: any) {
            toast.error(e.message || "Erreur lors de la mise à jour")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions Client</DropdownMenuLabel>

                <DropdownMenuItem onClick={() => toast.info("Détails bientôt disponibles")}>
                    <User className="mr-2 h-4 w-4" /> Voir détails & Achats
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Level Control */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Shield className="mr-2 h-4 w-4" /> Changer Niveau
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdate({ level: 'NONE' })} className={user.level === 'NONE' ? 'bg-slate-100' : ''}>
                            NONE (Base)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdate({ level: 'STANDARD' })} className={user.level === 'STANDARD' ? 'bg-slate-100' : ''}>
                            STANDARD
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdate({ level: 'PREMIUM' })} className={user.level === 'PREMIUM' ? 'bg-slate-100' : ''}>
                            PREMIUM
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Status Control */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <ToggleLeft className="mr-2 h-4 w-4" /> Changer Statut
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdate({ status: 'ACTIVE' })} className={user.status === 'ACTIVE' ? 'bg-slate-100' : ''}>
                            ACTIVER
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdate({ status: 'SUSPENDED' })} className={user.status === 'SUSPENDED' ? 'bg-slate-100' : ''}>
                            SUSPENDRE
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Language Control */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Languages className="mr-2 h-4 w-4" /> Langue Préférée
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdate({ locale: 'fr' })}>Français (FR)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdate({ locale: 'it' })}>Italiano (IT)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdate({ locale: 'de' })}>Deutsch (DE)</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}
