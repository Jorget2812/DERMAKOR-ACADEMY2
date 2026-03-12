/**
 * Centralized environment variable validation.
 * Fails fast at startup if required vars are missing.
 *
 * Import this module in any server-side code that needs env vars,
 * or call validateServerEnv() in instrumentation.ts if added.
 */

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(
            `[config] Missing required environment variable: ${name}. ` +
            `Check your .env.local file against .env.local.example.`
        )
    }
    return value
}

function requireEnvOnServer(name: string): string {
    if (typeof window !== 'undefined') {
        throw new Error(`[config] Server-only variable ${name} accessed on client.`)
    }
    return requireEnv(name)
}

// ─── Public (safe for client) ─────────────────────────────────────────────────
export const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
export const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Server-only ─────────────────────────────────────────────────────────────
// These are lazily accessed so they don't fail on the client bundle
export function getServiceRoleKey(): string {
    return requireEnvOnServer('SUPABASE_SERVICE_ROLE_KEY')
}

export function getStripeSecretKey(): string {
    return requireEnvOnServer('STRIPE_SECRET_KEY')
}

export function getStripeWebhookSecret(): string {
    return requireEnvOnServer('STRIPE_WEBHOOK_SECRET')
}

export function getSmtpUser(): string {
    return requireEnvOnServer('SMTP_USER')
}

export function getSmtpPassword(): string {
    return requireEnvOnServer('SMTP_PASSWORD')
}

/**
 * Call this in server initialization to validate all required vars at once.
 * Useful in instrumentation.ts or a startup check script.
 */
export function validateServerEnv(): void {
    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'SMTP_USER',
        'SMTP_PASSWORD',
        'NEXT_PUBLIC_APP_URL',
    ]

    const missing = required.filter(k => !process.env[k])
    if (missing.length > 0) {
        throw new Error(
            `[config] Missing required environment variables:\n  ${missing.join('\n  ')}\n` +
            `Check your .env.local file against .env.local.example.`
        )
    }
}
