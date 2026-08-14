import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // 1. Intercept incoming requests containing a ?code= parameter (e.g. /?code=... or /login?code=...)
    // and route them directly to /auth/callback to perform authorization code exchange.
    if (request.nextUrl.searchParams.has('code') && !pathname.startsWith('/auth/callback')) {
      const callbackUrl = new URL('/auth/callback', request.url);
      callbackUrl.search = request.nextUrl.search;
      return NextResponse.redirect(callbackUrl);
    }

    const isProtectedRoute =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/inventory') ||
      pathname.startsWith('/invoices');

    const isProtectedApi =
      pathname.startsWith('/api/products') ||
      pathname.startsWith('/api/invoices');

    // Fast cookie inspection for Supabase auth session token
    const cookies = request.cookies.getAll();
    const hasAuthToken = cookies.some(
      (c) => c.name.includes('auth-token') || c.name.includes('sb-') || c.name.includes('supabase')
    );

    if (!hasAuthToken && isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!hasAuthToken && isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware exception:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
