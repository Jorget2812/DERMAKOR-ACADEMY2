import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/auth/set-password
 *
 * Validates our custom invitation token and sets the user's password
 * via Supabase Admin API (updateUserById — requires SUPABASE_SERVICE_ROLE_KEY).
 *
 * Order of operations:
 * 1. Validate token (exists, not used, not expired)
 * 2. updateUserById → set password
 * 3. ONLY if (2) succeeded → mark token as used
 */
export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Token et mot de passe requis.' }, { status: 400 })
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 })
        }

        // MUST use service_role key — anon key cannot call auth.admin.updateUserById
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!serviceRoleKey) {
            console.error('[set-password] SUPABASE_SERVICE_ROLE_KEY is not set!')
            return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // 1. Find and validate token
        const { data: invitation, error: tokenError } = await supabaseAdmin
            .from('invitation_tokens')
            .select('id, user_id, email, expires_at, used')
            .eq('token', token)
            .single()

        if (tokenError || !invitation) {
            console.warn('[set-password] Token not found:', tokenError?.message)
            return NextResponse.json({ error: 'Lien invalide ou déjà utilisé.' }, { status: 400 })
        }

        if (invitation.used) {
            return NextResponse.json({ error: 'Ce lien a déjà été utilisé.' }, { status: 400 })
        }

        if (new Date(invitation.expires_at) < new Date()) {
            return NextResponse.json({ error: "Ce lien a expiré. Contactez l'administrateur." }, { status: 400 })
        }

        // 2. Set password FIRST — only mark token used if this succeeds
        console.log('[set-password] Updating password for user:', invitation.user_id)
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            invitation.user_id,
            { password, email_confirm: true }
        )
        console.log('[set-password] updateUserById result:', {
            userId: updatedUser?.user?.id ?? null,
            error: updateError?.message ?? null
        })

        if (updateError) {
            console.error('[set-password] Password update failed:', updateError.message)
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour du mot de passe: ' + updateError.message },
                { status: 500 }
            )
        }

        // 3. Only now mark token as used (idempotent — if this fails, user can retry)
        const { error: markError } = await supabaseAdmin
            .from('invitation_tokens')
            .update({ used: true })
            .eq('id', invitation.id)

        if (markError) {
            // Non-critical: password was set, just log the issue
            console.warn('[set-password] Could not mark token as used:', markError.message)
        }

        return NextResponse.json({ success: true, email: invitation.email })

    } catch (err: any) {
        console.error('[set-password] Unexpected error:', err.message)
        return NextResponse.json({ error: 'Erreur serveur inattendue.' }, { status: 500 })
    }
}
