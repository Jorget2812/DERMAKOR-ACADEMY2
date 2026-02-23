'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '../store'

export function CartSync() {
    const setUserId = useCart(state => state.setUserId)
    const supabase = createClient()

    useEffect(() => {
        // Sync initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id || null)
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                setUserId(session?.user?.id || null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, setUserId])

    return null // Logic only component
}
