'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * Renders children only on the client side (after hydration).
 * Use this to wrap Radix UI dropdowns / components that generate
 * IDs via useId() to prevent SSR ↔ client hydration mismatches.
 */
export function ClientOnly({
    children,
    fallback = null,
}: {
    children: ReactNode
    fallback?: ReactNode
}) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    return mounted ? <>{children}</> : <>{fallback}</>
}
