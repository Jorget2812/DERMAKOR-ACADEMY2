import AdminSidebar from "@/components/domains/admin/admin-sidebar"
import { ensureAdmin } from "@/lib/auth/admin-guard"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Strict server-side check
    await ensureAdmin()

    // Fetch pending verifications count for sidebar badge
    const supabase = await createClient()
    const { count: pendingCount } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex">
            {/* Admin Sidebar */}
            <AdminSidebar pendingVerifications={pendingCount || 0} />

            <div className="flex-grow flex flex-col pl-64">
                <header className="h-20 border-b bg-white/80 backdrop-blur-md flex items-center px-10 sticky top-0 z-40 border-border/40">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-1">Administration</span>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-primary">Panneau de Contrôle</h2>
                    </div>
                    <div className="ml-auto flex items-center gap-6">
                        <div className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            SYSTÈME LIVE (CHF)
                        </div>
                    </div>
                </header>

                <main className="p-10 lg:p-16 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
