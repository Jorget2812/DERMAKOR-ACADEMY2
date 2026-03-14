import AdminSidebar from "@/components/domains/admin/admin-sidebar"
import { ensureAdmin } from "@/lib/auth/admin-guard"
import { createClient } from "@/lib/supabase/server"
import { getAdminNotificationCounts } from "@/domains/admin/notification-actions"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Strict server-side check
    await ensureAdmin()

    // Fetch pending notifications for sidebar badge
    const { pendingOrders, pendingVerifications } = await getAdminNotificationCounts()

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex">
            {/* Admin Sidebar */}
            <AdminSidebar
                pendingVerifications={pendingVerifications}
                pendingOrders={pendingOrders}
            />

            <div className="flex-grow flex flex-col md:pl-64">
                <header className="h-16 md:h-20 border-b bg-white/80 backdrop-blur-md flex items-center px-4 md:px-10 sticky top-0 z-40 border-border/40">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-1">Administration</span>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-primary">Panneau de Contrôle</h2>
                    </div>
                    <div className="ml-auto flex items-center gap-3 md:gap-6">
                        <div className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <span className="hidden sm:inline">SYSTÈME LIVE (CHF)</span>
                            <span className="sm:hidden">LIVE</span>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 md:p-10 lg:p-16 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
