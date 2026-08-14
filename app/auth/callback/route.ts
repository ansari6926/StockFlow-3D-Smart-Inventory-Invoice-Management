import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/email-confirmed';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle explicit errors sent by Supabase (e.g. expired link)
  if (error || errorDescription) {
    console.error('Auth callback error from Supabase:', error, errorDescription);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', errorDescription || error || 'Authentication link is invalid or has expired.');
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(new URL(next, request.url));
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(new URL(next, request.url));
        }
      }

      console.error('Auth callback exchangeCodeForSession error:', exchangeError);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', exchangeError.message || 'Invalid or expired confirmation link. Please try signing in.');
      return NextResponse.redirect(loginUrl);
    } catch (err: any) {
      console.error('Auth callback unexpected error:', err);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Failed to process confirmation code. Please try signing in.');
      return NextResponse.redirect(loginUrl);
    }
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'Missing confirmation code. Please try signing in.');
  return NextResponse.redirect(loginUrl);
}
