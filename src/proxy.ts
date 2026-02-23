import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'

const intlMiddleware = createMiddleware({
    locales: ['fr', 'it', 'de'],
    defaultLocale: 'fr',
    localePrefix: 'always'
})

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Excluir rutas internas, API y assets comunes (usando regex para extensiones)
    // Esto protege carpetas como /.well-known al no usar pathname.includes('.')
    const isPublicAsset = /\.(svg|png|jpg|jpeg|gif|webp|pdf|zip|txt|xml|ico)$/.test(pathname)
    const isInternal = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/assets')

    if (isInternal || isPublicAsset) {
        return await updateSession(request, NextResponse.next())
    }

    // 2. Ejecutar i18n middleware (Maneja redirecciones / -> /fr y /shop -> /fr/shop)
    const response = intlMiddleware(request)

    // 3. Actualizar sesión de Supabase
    return await updateSession(request, response)
}

export const config = {
    matcher: [
        // Una sola regla robusta: todo excepto lo que no debe pasar por i18n
        '/((?!api|_next/static|_next/image|assets|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|zip|txt|xml)$).*)'
    ]
}
