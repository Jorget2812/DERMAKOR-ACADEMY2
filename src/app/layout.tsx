import { ReactNode } from "react";
import "./globals.css";

// Root Layout mandatory for Next.js 16
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
