import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { Search, GraduationCap } from 'lucide-react'
import { CartButton } from '@/domains/commerce/components/CartButton'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { listCategoriesPublic } from '@/domains/commerce/actions'
import { ShopDropdown } from '@/components/ShopDropdown'

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
                            Dermakor<span className="text-accent">Academy</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-12 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/70">
                        <ShopDropdown label={t('products')} categories={categories} />
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
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="border-t bg-secondary/50">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <Link href="/" className="text-lg font-serif font-bold uppercase mb-4 block">
                                Dermakor<span className="text-accent">Academy</span>
                            </Link>
                            <p className="text-muted-foreground max-w-xs text-sm">
                                {indexT('footer.desc')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Liens</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/shop" className="hover:text-accent">Boutique</Link></li>
                                <li><Link href="/academy-info" className="hover:text-accent">L'Académie</Link></li>
                                <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Légal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/cgv" className="hover:text-accent">CGV</Link></li>
                                <li><Link href="/privacy" className="hover:text-accent">Confidentialité</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
                        © {new Date().getFullYear()} DERMAKOR ACADEMY. Made in Switzerland.
                    </div>
                </div>
            </footer>
        </div>
    )
}
