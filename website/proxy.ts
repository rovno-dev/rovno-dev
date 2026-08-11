import { NextResponse, NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || "";

  if (hostname.startsWith('i.')) {
    if (url.pathname === '/' || url.pathname === '') {
      return new NextResponse(
        '<!DOCTYPE html><html><head><title></title></head><body style="background:transparent;"></body></html>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    url.pathname = `/i${url.pathname}`;
    const response = NextResponse.rewrite(url);

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
