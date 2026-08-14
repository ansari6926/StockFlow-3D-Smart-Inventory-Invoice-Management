import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const DEFAULT_SUPABASE_URL = 'https://luxpmecozsggeootwcwq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_2zNkublJ_43fPxP92I1LJg_sjEEsEpJ';

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Intercept incoming requests containing a ?code= parameter (e.g. /?code=... or /login?code=...)
    // and route them directly to /auth/callback to perform authorization code exchange.
    if (request.nextUrl.searchParams.has('code') && !pathname.startsWith('/auth/callback')) {
      const callbackUrl = new URL('/auth/callback', request.url);
      callbackUrl.search = request.nextUrl.search;
      return NextResponse.redirect(callbackUrl);
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    const isProtectedRoute =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/inventory') ||
      pathname.startsWith('/invoices');

    const isProtectedApi =
      pathname.startsWith('/api/products') ||
      pathname.startsWith('/api/invoices');

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          } catch {
            // Edge runtime cookie mutation catch
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!user && isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Redirect authenticated users away from auth pages
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return supabaseResponse;
  } catch (err) {
    console.error('Middleware execution error:', err);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
