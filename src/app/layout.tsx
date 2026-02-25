import type { ReactNode } from 'react'
import { Manrope, Playfair_Display } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-sans',
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-serif',
    weight: ['400', '500', '600', '700', '800', '900'],
    display: 'swap',
})

/**
 * Root layout — the ONLY place <html> and <body> live.
 * lang + className are set here; [locale]/layout.tsx must NOT re-render them.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html
            lang="fr"
            suppressHydrationWarning
            className={`${manrope.variable} ${playfair.variable}`}
        >
            <body
                className="font-sans antialiased text-foreground bg-background"
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    )
}
