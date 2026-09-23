import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const url = request.nextUrl.clone()
    const hostname = request.headers.get('host')?.split(':')[0]
    const baseDomain = (process.env.NEXT_PUBLIC_DOMAIN || '').trim().toLowerCase()

    if (!baseDomain) return NextResponse.next()
    if (url.pathname.startsWith('/_next')) return NextResponse.next()
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/dev-storage')) return NextResponse.next()
    if (url.pathname.includes('.')) return NextResponse.next()
    if (!hostname || hostname === baseDomain) return NextResponse.next()

    const subdomain = hostname.split('.')[0]
    if (!subdomain || subdomain === baseDomain) return NextResponse.next()

    url.pathname = `/subdomains/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
}
