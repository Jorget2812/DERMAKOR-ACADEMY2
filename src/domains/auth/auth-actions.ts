'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from '@/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const locale = formData.get('locale') as string || 'fr'

    const supabase = await createClient()

    const { error, data: { user } } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: "Identifiants invalides" }
    }

    if (!user) return { error: "Erreur de connexion" }

    // Check for admin status to determine redirect
    const { data: isAdmin } = await supabase.rpc('is_admin')

    if (isAdmin) {
        return { redirect: `/${locale}/admin` }
    } else {
        return { redirect: `/${locale}/app` }
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/')
    return redirect({ href: '/', locale: 'fr' })
}
