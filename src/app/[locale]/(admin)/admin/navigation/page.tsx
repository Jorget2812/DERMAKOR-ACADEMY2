import { getNavItems, getSiteSettings } from '@/domains/admin/nav-actions'
import { NavigationEditor } from '@/domains/admin/components/NavigationEditor'
import { Layout } from 'lucide-react'

export const metadata = {
    title: 'Navigation & En-tête | Admin',
}

export default async function AdminNavigationPage() {
    const [items, settings] = await Promise.all([
        getNavItems(),
        getSiteSettings()
    ])

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                        <Layout size={20} />
                    </div>
                    <h1 className="text-3xl font-serif text-primary">Navigation & En-tête</h1>
                </div>
                <p className="text-muted-foreground text-sm font-light uppercase tracking-widest pl-13">
                    Gérez le logo, les couleurs du bandeau et la structure du menu principal.
                </p>
            </header>

            <NavigationEditor
                initialItems={items}
                initialSettings={settings}
            />
        </div>
    )
}
