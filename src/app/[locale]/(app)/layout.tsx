import Sidebar from "@/components/domains/app-shell/sidebar"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GraduationCap, LogOut } from 'lucide-react'
import { MobileBottomNav } from "@/components/app/MobileBottomNav"
import { logout } from '@/domains/auth/auth-actions'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Basic check for verification status (ideally done in middleware too)
    const { data: profile } = await supabase
        .from('profiles')
        .select('verification_status, status')
        .eq('id', user.id)
        .single()

    if (!profile || profile.verification_status !== 'APPROVED' || profile.status !== 'ACTIVE') {
        redirect('/app/pending')
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <div className="flex-grow flex flex-col md:pl-64">
                {/* Mobile Header */}
                <header className="md:hidden h-20 border-b flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur-md z-40 border-border/40">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-white shadow-lg shadow-accent/20">
                            <GraduationCap size={16} />
                        </div>
                        <span className="font-bold text-[10px] uppercase tracking-[0.2em]">Dermakor<span className="text-accent">Academy</span></span>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#C0A76A]/30 text-[#C0A76A] hover:bg-[#C0A76A] hover:text-white transition-all duration-300 font-oswald text-[9px] uppercase tracking-[0.2em] font-bold"
                        >
                            <LogOut size={13} />
                            Déconnexion
                        </button>
                    </form>
                </header>

                <main className="p-6 pb-24 md:p-10 lg:p-16 max-w-7xl mx-auto w-full transition-all duration-500">
                    {children}
                </main>

                <MobileBottomNav />
            </div>
        </div>
    )
}
