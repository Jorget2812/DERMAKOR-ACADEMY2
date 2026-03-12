/**
 * Structured logger for server-side use.
 *
 * - In development: colored, human-readable output
 * - In production: JSON lines (compatible with Vercel log drains, Datadog, etc.)
 * - Never logs sensitive fields (passwords, tokens, keys)
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   const log = logger('stripe-webhook')
 *   log.info('Order processed', { orderId, userId })
 *   log.error('Payment failed', { orderId }, err)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogContext = Record<string, unknown>

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
}

// In production, suppress debug logs. In dev, show all.
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

// Fields that must never appear in logs
const SENSITIVE_KEYS = new Set([
    'password', 'token', 'secret', 'key', 'authorization',
    'service_role', 'anon_key', 'smtp_password', 'credit_card',
])

function redact(obj: LogContext): LogContext {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
            k,
            SENSITIVE_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v,
        ])
    )
}

function shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL]
}

function formatProduction(level: LogLevel, scope: string, message: string, ctx?: LogContext, err?: unknown): string {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        scope,
        message,
        ...(ctx ? redact(ctx) : {}),
        ...(err instanceof Error ? { error: err.message, stack: err.stack } : {}),
    })
}

function formatDevelopment(level: LogLevel, scope: string, message: string, ctx?: LogContext, err?: unknown): string {
    const colors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
    }
    const reset = '\x1b[0m'
    const ts = new Date().toISOString().split('T')[1].slice(0, 12)
    const ctxStr = ctx ? ' ' + JSON.stringify(redact(ctx)) : ''
    const errStr = err instanceof Error ? `\n  ${err.stack}` : ''
    return `${colors[level]}[${ts}] ${level.toUpperCase()} [${scope}]${reset} ${message}${ctxStr}${errStr}`
}

export interface Logger {
    debug(message: string, ctx?: LogContext): void
    info(message: string, ctx?: LogContext): void
    warn(message: string, ctx?: LogContext, err?: unknown): void
    error(message: string, ctx?: LogContext, err?: unknown): void
}

export function logger(scope: string): Logger {
    const isProd = process.env.NODE_ENV === 'production'

    function write(level: LogLevel, message: string, ctx?: LogContext, err?: unknown): void {
        if (!shouldLog(level)) return

        const formatted = isProd
            ? formatProduction(level, scope, message, ctx, err)
            : formatDevelopment(level, scope, message, ctx, err)

        if (level === 'error') {
            console.error(formatted)
        } else if (level === 'warn') {
            console.warn(formatted)
        } else {
            console.log(formatted)
        }
    }

    return {
        debug: (msg, ctx) => write('debug', msg, ctx),
        info: (msg, ctx) => write('info', msg, ctx),
        warn: (msg, ctx, err) => write('warn', msg, ctx, err),
        error: (msg, ctx, err) => write('error', msg, ctx, err),
    }
}
