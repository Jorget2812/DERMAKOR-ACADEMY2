import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth callback handler for Supabase invitation links.
 * 
 * Supabase sends the user here after clicking the invitation email.
 * The URL contains a `code` query parameter that we exchange for a session.
 * After establishing the session, we redirect to the set-password page.
 * 
 * This route is intentionally under /api/ so it is excluded from
 * the next-intl middleware (which would otherwise prepend a locale).
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)

    const code = searchParams.get('code')
    const type = searchParams.get('type') // 'invite' | 'recovery' | etc.
    const next = searchParams.get('next') ?? '/fr/auth/set-password'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Invitation flow → always go to set-password
            if (type === 'invite') {
                return NextResponse.redirect(new URL('/fr/auth/set-password', origin))
            }
            // Generic next param (e.g. password reset)
            return NextResponse.redirect(new URL(next, origin))
        }

        console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    }

    // No code or exchange failed — still redirect to set-password
    // The page itself will detect session state from hash tokens
    return NextResponse.redirect(new URL('/fr/auth/set-password', origin))
}
