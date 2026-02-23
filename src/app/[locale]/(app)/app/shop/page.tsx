import { listProductsForVerified, getCategories } from '@/domains/commerce/actions'
import { Badge } from "@/components/ui/badge"
import { Percent } from 'lucide-react'
import { ShopClient } from '@/domains/commerce/components/ShopClient'

export default async function VerifiedShopPage() {
    // Parallel fetch for better performance
    const products = await listProductsForVerified()

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-secondary/50">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/5 rounded-full text-[9px] font-bold text-accent uppercase tracking-[0.2em] animate-pulse">
                        B2B Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-primary leading-tight">
                        Boutique<span className="italic ml-2 font-light text-accent">Professionnelle</span>
                    </h1>
                    <p className="text-lg text-primary/50 font-medium tracking-tight leading-relaxed">
                        Catalogue exclusif avec tarifs préférentiels et gestion de stock en temps réel.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-6 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/20">
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-white shadow-lg">
                        <span className="text-lg font-bold">%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Statut Tarifaire</span>
                        <span className="text-sm font-bold text-primary tracking-tight">Remises appliquées</span>
                    </div>
                </div>
            </header>

            <ShopClient
                initialProducts={products}
            />
        </div>
    )
}
