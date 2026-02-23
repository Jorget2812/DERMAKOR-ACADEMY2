import { ReactNode } from "react";
import "./globals.css";

// Root Layout mínimo obligatorio para Next.js 16
// No debe renderizar componentes con hooks de next-intl (Sidebar, etc.)
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
