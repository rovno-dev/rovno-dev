import { NextResponse, NextRequest } from 'next/server';

// Root domain without subdomain — used to detect "are we on a subdomain?"
// and to build absolute redirect targets. When unset (dev, previews, CI),
// the middleware falls through to plain Next.js routing and paths still work.
const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || '').trim().toLowerCase();

function getSubdomain(hostname: string): string | null {
  if (!ROOT_DOMAIN) return null;
  const host = hostname.split(':')[0].toLowerCase();
  if (host === ROOT_DOMAIN) return null;
  if (!host.endsWith(`.${ROOT_DOMAIN}`)) return null;
  const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
  if (!sub || sub.includes('.')) return null; // single-level only
  return sub;
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const subdomain = getSubdomain(hostname);

  // ---------------------------------------------------------------
  // 1. i.<root> — asset delivery subdomain (existing behaviour)
  // ---------------------------------------------------------------
  if (subdomain === 'i') {
    if (url.pathname === '/' || url.pathname === '') {
      return new NextResponse(
        '<!DOCTYPE html><html><head><title></title></head><body style="background:transparent;"></body></html>',
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }
    url.pathname = `/i${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // ---------------------------------------------------------------
  // 2. app.<root> — user account area. Rewrites to internal /app/*
  // ---------------------------------------------------------------
  if (subdomain === 'app') {
    if (!url.pathname.startsWith('/app')) {
      url.pathname = `/app${url.pathname === '/' ? '' : url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ---------------------------------------------------------------
  // 3. admin.<root> — admin panel. Rewrites to internal /admin/*.
  //    Keeps the same shared-secret gate the path-based route had.
  // ---------------------------------------------------------------
  if (subdomain === 'admin') {
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const secret = process.env.ADMIN_SECRET_URI;
    if (url.pathname !== '/' && pathSegments[0] !== secret) {
      return new NextResponse('Not Found', { status: 404 });
    }
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ---------------------------------------------------------------
  // 4. Root domain — redirect path-based /app and /admin to canonical
  //    subdomains. Prevents duplicate content, keeps cookies scoped.
  // ---------------------------------------------------------------
  if (ROOT_DOMAIN) {
    if (url.pathname === '/app' || url.pathname.startsWith('/app/')) {
      const rest = url.pathname.slice(4) || '/';
      const dest = new URL(`https://app.${ROOT_DOMAIN}${rest}`);
      dest.search = url.search;
      return NextResponse.redirect(dest, 308);
    }
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      const rest = url.pathname.slice(6) || '/';
      const dest = new URL(`https://admin.${ROOT_DOMAIN}${rest}`);
      dest.search = url.search;
      return NextResponse.redirect(dest, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
