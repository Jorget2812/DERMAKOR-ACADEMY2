import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protection logic
    const pathname = request.nextUrl.pathname
    const isAppRoot = /^\/(fr|it|de)\/app/.test(pathname)
    const isAdminRoot = /^\/(fr|it|de)\/admin/.test(pathname)

    if ((isAppRoot || isAdminRoot) && !user) {
        const locale = pathname.split('/')[1] || 'fr'
        const url = new URL(`/${locale}/login`, request.url)
        return NextResponse.redirect(url)
    }

    if (user) {
        if (isAdminRoot) {
            const { data: isAdmin } = await supabase.rpc('is_admin')
            if (!isAdmin) {
                const locale = pathname.split('/')[1] || 'fr'
                const url = new URL(`/${locale}/app`, request.url)
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}
