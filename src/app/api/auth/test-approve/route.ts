
import { NextResponse } from 'next/server'
import { approveVerification } from '@/domains/admin/admin-actions'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) return NextResponse.json({ error: 'Missing requestId' })

    try {
        console.log('[TEST-APPROVE] Triggering for:', requestId)
        const result = await approveVerification(requestId)
        return NextResponse.json(result)
    } catch (err: any) {
        console.error('[TEST-APPROVE] Caught in Route:', err.message)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
