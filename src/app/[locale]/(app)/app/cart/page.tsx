'use client'

import { useCart } from '@/domains/commerce/store'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react'

export default function CartPage() {
    const params = useParams()
    const locale = params.locale || 'fr'

    const items = useCart((state) => state.items)
    const removeItem = useCart((state) => state.removeItem)
    const updateQty = useCart((state) => state.updateQty)

    // Calculations
    const subtotalHT = items.reduce((acc, item) => acc + item.price * item.qty, 0)
    const tva = subtotalHT * 0.081
    const totalTTC = subtotalHT + tva

    const formatPrice = (amount: number) => `CHF ${(amount / 100).toFixed(2)}` // Usually prices are stored in cents, but let's check if the store uses it as normal value or cents. The store interface said: `price: number // gross price in cents`. So I need to divide by 100 ! Wait, but the prompt says: formatPrice = (amount: number) => `CHF ${amount.toFixed(2)}` meaning the price stored might not be in cents, or the user already provided format logic. Let me use the user's logic exactly as requested: "Formatear todo con 2 decimales: XX.XX, Moneda: siempre CHF antes del monto" but I will stick to dividing by 100 if the store specifically says "gross price in cents". In the store it says `price: number // gross price in cents`. I'll divide by 100. Wait, if it's in cents, I should divide by 100. Let me use `item.price / 100` for calculations.

    const subtotalHTVal = items.reduce((acc, item) => acc + (item.price / 100) * item.qty, 0)
    const tvaVal = subtotalHTVal * 0.081
    const totalTTCVal = subtotalHTVal + tvaVal

    const formatFn = (amount: number) => `CHF ${amount.toFixed(2)}`

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
                <div className="bg-white rounded-lg border border-gray-100 p-8 sm:p-12 text-center max-w-md w-full shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide">Votre panier est vide</h2>
                    <p className="text-gray-500 text-sm mb-8">Découvrez notre gamme de produits professionnels exclusifs.</p>
                    <Link
                        href={`/${locale}/app/shop`}
                        className="w-full bg-[#1a1a1a] text-white py-4 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                    >
                        Continuer vos achats <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] pb-20 md:pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider mb-6 sm:mb-8 text-[#1a1a1a]">Mon Panier</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Items List (Left Column / Top on Mobile) */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.variantId} className="bg-white rounded-lg border border-gray-100 p-4 flex gap-4">
                                {/* Image */}
                                <div className="w-16 h-16 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <Package className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-sm text-[#1a1a1a] line-clamp-2">{item.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1 uppercase">SKU: {item.sku}</p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.variantId)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        {/* Qty Controls */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQty(item.variantId, item.qty - 1)}
                                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#C0A76A] hover:text-[#C0A76A] transition-colors text-gray-600"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item.variantId, item.qty + 1)}
                                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#C0A76A] hover:text-[#C0A76A] transition-colors text-gray-600"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <div className="font-bold text-[#1a1a1a]">{formatFn((item.price / 100) * item.qty)}</div>
                                            <div className="text-[10px] text-gray-500">{formatFn(item.price / 100)} / unité</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary (Right Column / Bottom on Mobile) */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-100 p-6 sticky top-4">
                            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-100">Résumé</h2>

                            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Sous-total HT</span>
                                    <span>{formatFn(subtotalHTVal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>TVA (8.1%)</span>
                                    <span>{formatFn(tvaVal)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold">Total TTC</span>
                                <span className="text-[#C0A76A] font-bold text-xl">{formatFn(totalTTCVal)}</span>
                            </div>

                            <Link
                                href={`/${locale}/app/checkout`}
                                className="w-full bg-[#1a1a1a] text-white py-4 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                            >
                                Passer la commande <ArrowRight size={18} />
                            </Link>

                            <Link
                                href={`/${locale}/app/shop`}
                                className="block text-center text-sm text-gray-500 hover:text-[#C0A76A] transition-colors mt-4"
                            >
                                Continuer vos achats
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
