import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/providers"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { validateLocale } from './proxy';
import { locales } from "@/navigation";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800"]
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "DERMAKOR ACADEMY",
  description: "Elite Dermo-Esthétique en Suisse",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  // Resolución robusta de params para Next 16
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;

  // Validación y seguridad vía proxy.ts
  validateLocale(locale);

  // Requerido para renderizado estático/consistencia servidor en next-intl
  setRequestLocale(locale);

  // Carga de mensajes con fallback
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.warn(`[i18n] Fallback a 'fr' para locale: ${locale}`);
    messages = await getMessages({ locale: 'fr' });
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(manrope.variable, playfair.variable)}
    >
      <body className="font-sans antialiased text-foreground bg-background" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
