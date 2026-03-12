import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { hashToken } from '@/lib/crypto'
import { authLimiter, getIP } from '@/lib/rate-limit'

const log = logger('set-password')

/**
 * POST /api/auth/set-password
 *
 * Validates our custom invitation token and sets the user's password
 * via Supabase Admin API (updateUserById — requires SUPABASE_SERVICE_ROLE_KEY).
 */
export async function POST(request: NextRequest) {
    const ip = getIP(request)

    // 0. Rate limiting (Upstash Redis)
    const { success, reset } = await authLimiter.limit(ip)
    if (!success) {
        log.warn('Rate limit exceeded', { ip })
        const now = Date.now()
        const retryAfterSec = Math.ceil((reset - now) / 1000)
        return NextResponse.json(
            { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
            {
                status: 429,
                headers: { 'Retry-After': String(retryAfterSec) },
            }
        )
    }

    try {
        const body = await request.json()
        const { token, password } = body ?? {}

        if (!token || !password) {
            return NextResponse.json({ error: 'Token et mot de passe requis.' }, { status: 400 })
        }
        if (typeof password !== 'string' || password.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
                { status: 400 }
            )
        }
        if (typeof token !== 'string' || token.length < 32) {
            return NextResponse.json({ error: 'Lien invalide ou déjà utilisé.' }, { status: 400 })
        }

        const supabaseAdmin = createAdminClient()

        // 1. Find and validate token — DB stores SHA-256 hash, so hash before lookup
        const tokenHash = hashToken(token)
        const { data: invitation, error: tokenError } = await supabaseAdmin
            .from('invitation_tokens')
            .select('id, user_id, email, expires_at, used')
            .eq('token', tokenHash)
            .single()

        if (tokenError || !invitation) {
            log.warn('Token not found or invalid', { ip })
            return NextResponse.json({ error: 'Lien invalide ou déjà utilisé.' }, { status: 400 })
        }

        if (invitation.used) {
            log.warn('Token already used', { userId: invitation.user_id })
            return NextResponse.json({ error: 'Ce lien a déjà été utilisé.' }, { status: 400 })
        }

        if (new Date(invitation.expires_at) < new Date()) {
            log.warn('Token expired', { userId: invitation.user_id })
            return NextResponse.json(
                { error: "Ce lien a expiré. Contactez l'administrateur." },
                { status: 400 }
            )
        }

        // 2. Set password FIRST — only mark token used if this succeeds
        log.info('Setting password for invited user', { userId: invitation.user_id })

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            invitation.user_id,
            { password, email_confirm: true }
        )

        if (updateError) {
            log.error('Password update failed', { userId: invitation.user_id }, updateError)
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour du mot de passe.' },
                { status: 500 }
            )
        }

        // 3. Only now mark token as used (idempotent — if this fails, user can retry but will get "already used" on reuse)
        const { error: markError } = await supabaseAdmin
            .from('invitation_tokens')
            .update({ used: true })
            .eq('id', invitation.id)

        if (markError) {
            // Non-critical: password was set successfully
            log.warn('Could not mark token as used', { tokenId: invitation.id }, markError)
        }

        log.info('Password set successfully', { userId: invitation.user_id })
        return NextResponse.json({ success: true, email: invitation.email })

    } catch (err: unknown) {
        log.error('Unexpected error in set-password', { ip }, err)
        return NextResponse.json({ error: 'Erreur serveur inattendue.' }, { status: 500 })
    }
}
