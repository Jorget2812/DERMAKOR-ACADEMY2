import { createClient } from '@/lib/supabase/server'
import { Button } from "@/components/ui/button"
import { UserPlus, Filter } from 'lucide-react'
import { UsersTableContainer } from '@/domains/admin/components/UsersTableContainer'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-primary">Gestion des Professionnels</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-light">Gérez les privilèges et les accès de vos partenaires.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-200"><Filter className="w-4 h-4 mr-2" /> Filtres</Button>
                    <Button className="bg-accent hover:bg-accent/90 text-white"><UserPlus className="w-4 h-4 mr-2" /> Inviter</Button>
                </div>
            </header>

            <UsersTableContainer initialProfiles={profiles as any} />
        </div>
    )
}
