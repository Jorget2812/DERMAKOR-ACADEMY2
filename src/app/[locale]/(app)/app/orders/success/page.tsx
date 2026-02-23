'use client'

import { useEffect } from 'react'
import { useCart } from '@/domains/commerce/store'
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package, ArrowRight, Download } from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPage() {
    const { clearCart } = useCart()

    useEffect(() => {
        clearCart()
    }, [clearCart])

    return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-8">
            <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100 animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-serif">Merci pour votre commande !</h1>
                <p className="text-muted-foreground text-lg">
                    Votre transaction a été traitée avec succès. Un e-mail de confirmation vous a été envoyé.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
                <div className="p-6 rounded-2xl border border-border/50 bg-white shadow-sm text-left space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <Package size={20} />
                    </div>
                    <h3 className="font-serif text-lg">Suivre ma commande</h3>
                    <p className="text-sm text-muted-foreground">
                        Vous pouvez suivre l'état de votre commande et télécharger votre facture dans votre espace client.
                    </p>
                    <Link href="/app/orders">
                        <Button variant="outline" className="w-full mt-2">
                            Gérer mes commandes
                        </Button>
                    </Link>
                </div>

                <div className="p-6 rounded-2xl border border-border/50 bg-white shadow-sm text-left space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Download size={20} />
                    </div>
                    <h3 className="font-serif text-lg">Protocoles & Academy</h3>
                    <p className="text-sm text-muted-foreground">
                        Si votre commande inclut des produits avec protocoles, ils sont désormais accessibles dans votre Académie.
                    </p>
                    <Link href="/app/academy">
                        <Button variant="outline" className="w-full mt-2">
                            Aller à l'Académie
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="pt-8">
                <Link href="/app/shop">
                    <Button variant="link" className="text-accent gap-2">
                        Retourner à la boutique <ArrowRight size={16} />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
