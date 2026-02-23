import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
    variantId: string
    name: string
    sku: string
    price: number // gross price in cents
    qty: number
    image: string | null
}

interface CartStore {
    items: CartItem[]
    userId: string | null
    addItem: (item: CartItem) => void
    removeItem: (variantId: string) => void
    updateQty: (variantId: string, qty: number) => void
    clearCart: () => void
    setUserId: (userId: string | null) => void
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            userId: null,
            addItem: (item) => {
                const items = get().items
                const existing = items.find((i) => i.variantId === item.variantId)
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i
                        ),
                    })
                } else {
                    set({ items: [...items, item] })
                }
            },
            removeItem: (variantId) => {
                set({ items: get().items.filter((i) => i.variantId !== variantId) })
            },
            updateQty: (variantId, qty) => {
                if (qty <= 0) {
                    get().removeItem(variantId)
                    return
                }
                set({
                    items: get().items.map((i) =>
                        i.variantId === variantId ? { ...i, qty } : i
                    ),
                })
            },
            clearCart: () => set({ items: [] }),
            setUserId: (userId) => {
                const currentId = get().userId
                if (userId !== currentId) {
                    // Reset if different user
                    set({ userId, items: [] })
                }
            }
        }),
        {
            name: 'dermakor-cart',
        }
    )
)
