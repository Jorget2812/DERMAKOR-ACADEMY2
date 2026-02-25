import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from '@/components/providers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { validateLocale } from './proxy'
import { locales } from '@/navigation'

export const metadata: Metadata = {
  title: 'DermaKor Swiss | Distribution Officielle KRX Aesthetics en Suisse',
  description:
    "Distributeur officiel KRX Aesthetics en Suisse. Cosméceutiques de grade clinique pour professionnels de l'esthétique.",
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/**
 * Locale layout — wraps children with i18n and app providers only.
 * MUST NOT render <html> or <body> — the root layout owns the document shell.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string } | Promise<{ locale: string }>
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { locale } = resolvedParams

  // Validate locale (redirects to /fr if invalid)
  validateLocale(locale)

  // Required for static rendering consistency in next-intl
  setRequestLocale(locale)

  // Load translations with FR fallback
  let messages
  try {
    messages = await getMessages({ locale })
  } catch {
    console.warn(`[i18n] Falling back to 'fr' for locale: ${locale}`)
    messages = await getMessages({ locale: 'fr' })
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  )
}
