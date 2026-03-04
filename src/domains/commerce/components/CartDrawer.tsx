'use client'

import { useCart } from '../store'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

export function CartDrawer({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const items = useCart(state => state.items)
    const removeItem = useCart(state => state.removeItem)
    const updateQty = useCart(state => state.updateQty)
    const clearCart = useCart(state => state.clearCart)

    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const total = useMemo(() => items.reduce((acc, item) => acc + item.price * item.qty, 0), [items])
    // RÈGLE: item.price = prix boutique HT (centimes). TVA 8.1% se calcule DESSUS pour TOUS.
    const subtotalHT = total / 100
    const vatAmount = Math.round(subtotalHT * 0.081 * 100) / 100
    const totalTTC = subtotalHT + vatAmount

    async function handleCheckout() {
        if (items.length === 0) return
        setOpen(false) // Close drawer
        window.location.href = '/app/checkout'
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader className="pb-6 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-accent" /> Votre Panier
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-grow overflow-y-auto py-6 space-y-6">
                    {!mounted ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Votre panier est vide.
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.variantId} className="flex gap-4">
                                <div className="w-20 h-20 bg-secondary rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag size={24} className="text-primary/10" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeItem(item.variantId)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center border rounded-md">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(item.variantId, item.qty - 1)}>
                                                <Minus size={12} />
                                            </Button>
                                            <span className="text-sm w-8 text-center">{item.qty}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(item.variantId, item.qty + 1)}>
                                                <Plus size={12} />
                                            </Button>
                                        </div>
                                        <span className="text-sm font-bold">{(item.price * item.qty / 100).toFixed(2)} CHF</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <SheetFooter className="border-t pt-6">
                    <div className="w-full space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Sous-total (HT)</span>
                                <span>{subtotalHT.toFixed(2)} CHF</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>TVA (8.1%)</span>
                                <span>{vatAmount.toFixed(2)} CHF</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                                <span>Total (TTC)</span>
                                <span>{totalTTC.toFixed(2)} CHF</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Frais de port calculés au checkout.
                        </p>
                        <Button
                            className="w-full py-6 text-lg bg-primary hover:bg-accent"
                            disabled={items.length === 0 || loading}
                            onClick={handleCheckout}
                        >
                            {loading ? "Préparation..." : "Procéder au paiement"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
