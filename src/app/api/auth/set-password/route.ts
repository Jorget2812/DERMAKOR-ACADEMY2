import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/auth/set-password
 *
 * Validates our custom invitation token and sets the user's password
 * via Supabase Admin API (updateUserById).
 *
 * WHY a custom token?
 * Gmail prefetches any link from *.supabase.co/auth/v1/verify → consumes
 * the Supabase OTP before the user clicks. Our custom token lives at
 * /fr/auth/set-password?token=xxx — Gmail prefetches the PAGE (GET = safe),
 * the token is only validated on POST (when the user submits the password).
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

        // Use service_role to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // 1. Find token
        const { data: invitation, error: tokenError } = await supabaseAdmin
            .from('invitation_tokens')
            .select('id, user_id, email, expires_at, used')
            .eq('token', token)
            .single()

        if (tokenError || !invitation) {
            return NextResponse.json({ error: 'Lien invalide ou déjà utilisé.' }, { status: 400 })
        }

        // 2. Check already used
        if (invitation.used) {
            return NextResponse.json({ error: 'Ce lien a déjà été utilisé.' }, { status: 400 })
        }

        // 3. Check expiry
        if (new Date(invitation.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Ce lien a expiré. Contactez l\'administrateur.' }, { status: 400 })
        }

        // 4. Set password via Admin API
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            invitation.user_id,
            { password }
        )

        if (updateError) {
            console.error('[set-password] updateUserById error:', updateError.message)
            return NextResponse.json({ error: 'Erreur lors de la mise à jour du mot de passe.' }, { status: 500 })
        }

        // 5. Mark token as used (one-time use)
        await supabaseAdmin
            .from('invitation_tokens')
            .update({ used: true })
            .eq('id', invitation.id)

        return NextResponse.json({ success: true, email: invitation.email })

    } catch (err: any) {
        console.error('[set-password] Unexpected error:', err.message)
        return NextResponse.json({ error: 'Erreur serveur inattendue.' }, { status: 500 })
    }
}
