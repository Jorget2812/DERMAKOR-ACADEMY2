import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/health
 * Basic health check for uptime monitoring (UptimeRobot, Vercel, etc.)
 * Does NOT expose internal details in production.
 */
export async function GET() {
    const start = Date.now()

    try {
        // Lightweight DB ping — checks connectivity without exposing data
        const supabase = createAdminClient()
        const { error } = await supabase.from('site_settings').select('key').limit(1)

        if (error) {
            return NextResponse.json(
                { status: 'degraded', db: 'error' },
                { status: 503 }
            )
        }

        return NextResponse.json({
            status: 'ok',
            latency_ms: Date.now() - start,
            ts: new Date().toISOString(),
        })
    } catch {
        return NextResponse.json(
            { status: 'error' },
            { status: 503 }
        )
    }
}
