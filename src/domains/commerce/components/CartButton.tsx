'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../store'
import { CartDrawer } from './CartDrawer'
import { Badge } from "@/components/ui/badge"

export function CartButton() {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const items = useCart(state => state.items)
    const itemCount = items.reduce((acc, i) => acc + i.qty, 0)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return (
        <Button variant="ghost" size="icon" className="relative rounded-full">
            <ShoppingCart className="w-5 h-5" />
        </Button>
    )

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                onClick={() => setOpen(true)}
            >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-accent text-white border-none text-[10px]">
                        {itemCount}
                    </Badge>
                )}
            </Button>
            <CartDrawer open={open} setOpen={setOpen} />
        </>
    )
}
