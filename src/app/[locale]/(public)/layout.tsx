import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { Search, GraduationCap } from 'lucide-react'
import { CartButton } from '@/domains/commerce/components/CartButton'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ClientOnly } from '@/components/ui/client-only'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { listCategoriesPublic } from '@/domains/commerce/actions'
import { Suspense } from 'react'
import { Footer } from '@/components/Footer'
import { MobileNavBar } from '@/components/MobileNavBar'
import { DynamicHeader } from '@/components/DynamicHeader'

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background pt-24">
            <Suspense fallback={<div className="h-24 bg-white/80 animate-pulse" />}>
                <DynamicHeader />
            </Suspense>

            <main className="flex-grow pb-24 md:pb-0">
                {children}
            </main>

            <Footer />
            <MobileNavBar />
        </div>
    )
}
