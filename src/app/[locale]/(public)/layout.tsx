import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { Search, GraduationCap } from 'lucide-react'
import { CartButton } from '@/domains/commerce/components/CartButton'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ClientOnly } from '@/components/ui/client-only'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { listCategoriesPublic } from '@/domains/commerce/actions'
import { ShopDropdown } from '@/components/ShopDropdown'
import { Footer } from '@/components/Footer'
import { MobileNavBar } from '@/components/MobileNavBar'

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const t = await getTranslations('Navigation');
    const indexT = await getTranslations('Index');

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch categories for the nav dropdown
    const categories = await listCategoriesPublic()

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Premium Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl border-border/40">
                <div className="container mx-auto px-6 h-24 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-500">
                            <GraduationCap size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-[0.15em] uppercase text-primary">
                            Dermakor<span className="text-accent">Swiss</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-12 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70">
                        <ClientOnly><ShopDropdown label={t('products')} categories={categories} /></ClientOnly>
                        <Link href="/about" className="hover:text-accent transition-all duration-300 hover:tracking-[0.3em]">{t('about')}</Link>

                        <Link href="/academy-info" className="hover:text-accent transition-all duration-300 hover:tracking-[0.3em]">{t('academy')}</Link>
                        <Link href="/pro" className="hover:text-accent transition-all duration-300 hover:tracking-[0.3em] font-bold text-accent border border-accent/20 px-4 py-2 rounded-full bg-accent/5">{t('register')}</Link>
                        <Link href="/login" className="hover:text-accent transition-all duration-300 hover:tracking-[0.3em]">Accès Pro</Link>
                    </nav>

                    <div className="flex items-center space-x-8">
                        <button className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] hover:text-accent transition-all group">
                            <Search className="w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
                        </button>
                        {user && <CartButton />}
                        <div className="h-6 w-px bg-border/60 mx-2 hidden sm:block" />
                        <ClientOnly><LanguageSwitcher /></ClientOnly>
                    </div>
                </div>
            </header>

            <main className="flex-grow pb-24 md:pb-0">
                {children}
            </main>

            <Footer />
            <MobileNavBar />
        </div>
    )
}
