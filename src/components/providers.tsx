'use client'

import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"
import { CartSync } from "@/domains/commerce/components/CartSync"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
            <CartSync />
            {children}
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    )
}
