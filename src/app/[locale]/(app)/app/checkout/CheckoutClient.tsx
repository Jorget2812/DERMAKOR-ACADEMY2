'use client'

import { useCart } from '@/domains/commerce/store'
import { CheckoutFlow } from '@/domains/commerce/components/CheckoutFlow'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getAvailableShippingRates, ShippingOption } from '@/domains/commerce/shipping-actions'

interface CheckoutClientProps {
    bankDetails: any
}

export function CheckoutFlowWrapper({ bankDetails }: CheckoutClientProps) {
    const items = useCart(state => state.items)
    const clearCart = useCart(state => state.clearCart)
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [shippingOptions, setShippingOptions] = useState<{
        standard: ShippingOption | null
        express: ShippingOption | null
    }>({ standard: null, express: null })

    useEffect(() => {
        setMounted(true)
    }, [])

    // RÈGLE: item.price = prix boutique (HT) en centimes
    // TVA 8.1% se calcule OVER le prix boutique, pour TOUS les niveaux sans exception
    const subtotal = items.reduce((acc, item: any) => acc + (item.price * item.qty), 0) / 100
    const vatAmount = Math.round(subtotal * 0.081 * 100) / 100

    // Calculate total weight from cart items (item may have weightGrams if available)
    const totalWeightGrams = items.reduce((acc, item: any) => acc + ((item.weightGrams ?? 0) * item.qty), 0)

    // Fetch shipping rates when mounted
    useEffect(() => {
        if (!mounted) return
        const safeWeight = Math.max(totalWeightGrams, 1)
        getAvailableShippingRates(safeWeight).then(setShippingOptions).catch(console.error)
    }, [mounted, totalWeightGrams])

    const handleComplete = () => {
        clearCart()
        router.push('/app/orders')
    }

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <h2 className="text-2xl font-serif text-primary/70">Votre panier est vide</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Ajoutez des produits professionnels pour continuer.</p>
                <button
                    onClick={() => router.push('/app/shop')}
                    className="mt-4 px-8 py-3 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px] hover:bg-accent transition-all"
                >
                    Découvrir nos produits
                </button>
            </div>
        )
    }

    return (
        <CheckoutFlow
            items={items}
            subtotal={subtotal}
            vatAmount={vatAmount}
            onComplete={handleComplete}
            bankDetails={bankDetails}
            shippingOptions={shippingOptions}
            totalWeightGrams={totalWeightGrams}
        />
    )
}
