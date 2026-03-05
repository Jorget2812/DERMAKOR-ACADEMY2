import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth callback handler — PKCE code exchange fallback.
 *
 * Supabase invitation emails use implicit flow by default:
 * the access_token arrives in the URL hash (#access_token=xxx).
 * Hashes are NEVER sent to the server, so this route only handles
 * the PKCE code-based flow (when `code` is present in query params).
 *
 * For implicit flow (hash tokens), the browser lands directly on
 * /fr/auth/set-password and the Supabase JS client picks up the hash.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(new URL('/fr/auth/set-password', origin))
        }

        console.error('[api/auth/callback] code exchange failed:', error.message)
    }

    // No code param → user arrived here by mistake. Send to set-password
    // which handles session detection gracefully.
    return NextResponse.redirect(new URL('/fr/auth/set-password', origin))
}
