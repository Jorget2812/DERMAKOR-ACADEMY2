'use client'

import { Button } from "@/components/ui/button"
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../store'
import { toast } from 'sonner'

interface AddToCartButtonProps {
    variantId: string
    name: string
    sku: string
    price: number
    image: string | null
    qty?: number
    disabled?: boolean
}

export function AddToCartButton({ variantId, name, sku, price, image, qty = 1, disabled }: AddToCartButtonProps) {
    const addItem = useCart(state => state.addItem)

    function handleAdd() {
        addItem({ variantId, name, sku, price, image, qty })
        toast.success(`${name} ajouté au panier`)
    }

    return (
        <Button
            className="w-full h-12 rounded-2xl bg-primary text-white hover:bg-accent transition-all duration-500 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/5 hover:shadow-accent/20 active:scale-[0.98]"
            disabled={disabled}
            onClick={handleAdd}
        >
            {disabled ? 'Stock Épuisé' : <><ShoppingCart className="w-4 h-4 mr-3 opacity-60" /> Ajouter au panier</>}
        </Button>
    )
}
