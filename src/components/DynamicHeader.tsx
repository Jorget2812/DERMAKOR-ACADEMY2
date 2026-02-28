import { getNavItems, getSiteSettings } from '@/domains/admin/nav-actions'
import { createClient } from '@/lib/supabase/server'
import { HeaderClient } from './HeaderClient'

export async function DynamicHeader() {
    // Parallel fetching for performance
    const [items, settings, supabase] = await Promise.all([
        getNavItems(),
        getSiteSettings(),
        createClient(),
    ])

    const { data: { user } } = await supabase.auth.getUser()

    return (
        <HeaderClient
            items={items}
            settings={settings}
            user={user}
        />
    )
}
