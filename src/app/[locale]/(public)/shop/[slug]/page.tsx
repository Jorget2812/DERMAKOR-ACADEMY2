import { createClient } from '@/lib/supabase/server'
import { Button } from "@/components/ui/button"
import { Link } from '@/navigation'
import { ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'

export default async function PublicProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: product, error } = await supabase.rpc('get_product_public', { p_slug: slug })


    if (error || !product || product.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-serif">Produit introuvable</h1>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/shop">Retour à la boutique</Link>
                </Button>
            </div>
        )
    }

    const p = product[0] as any

    return (
        <div className="container mx-auto px-4 py-12">
            <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                {/* Product Image Section */}
                <div className="aspect-[4/5] relative bg-[#F5F5F0] rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
                    {p.images?.[0] ? (
                        <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                            <ShoppingBag size={120} strokeWidth={0.5} />
                        </div>
                    )}
                </div>

                {/* Product Info Section */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <Badge variant="outline" className="mb-4 bg-accent/5 text-accent border-accent/20">Catalogue Public</Badge>
                        <h1 className="text-4xl md:text-5xl mb-4 leading-tight">{p.name}</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">{p.description}</p>
                    </div>

                    <div className="mt-auto pt-8 border-t space-y-6">
                        <div className="bg-secondary/50 rounded-xl p-6 border border-accent/10">
                            <div className="flex items-start gap-4">
                                <ShieldCheck className="w-8 h-8 text-accent flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-primary">Accès Professionnel Requis</h4>
                                    <p className="text-sm text-muted-foreground mt-1 text-balance">
                                        Les prix et la commande sont réservés aux professionnels de l'esthétique vérifiés.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <Button asChild className="flex-grow bg-primary hover:bg-accent text-white py-6 text-lg">
                                    <Link href="/pro">Demander mon accès Pro</Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-grow py-6 text-lg border-primary/20 hover:border-accent">
                                    <Link href="/login">Se connecter</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Variantes disponibles</h5>
                            <div className="flex flex-wrap gap-2">
                                {(p.variants as any[] | null)?.map((v: any) => (
                                    <Badge key={v.id} variant="secondary" className="px-3 py-1 font-medium">
                                        SKU: {v.sku}
                                    </Badge>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
