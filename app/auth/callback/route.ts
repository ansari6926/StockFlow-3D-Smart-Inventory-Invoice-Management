import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/email-confirmed';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // 1. Handle explicit errors passed in query params by Supabase
  if (error || errorDescription) {
    console.error('Auth callback received error params:', error, errorDescription);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', errorDescription || error || 'Authentication link is invalid or has expired.');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  // 2. Try OTP token_hash verification if present
  if (token_hash && type) {
    const { error: otpError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!otpError) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.warn('verifyOtp error:', otpError);
  }

  // 3. Try PKCE code exchange if code parameter is present
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    console.warn('exchangeCodeForSession error:', exchangeError.message);

    // If PKCE verifier is missing (e.g. link opened in Gmail app or different browser tab),
    // Supabase Auth has already verified the user's email address on the server when generating/clicking the confirmation link.
    // Check if user is authenticated or redirect to /email-confirmed so they can sign in cleanly.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    // Since the code was delivered by Supabase Auth confirmation email click,
    // the user's email is confirmed. Redirect to /email-confirmed page to proceed to Sign In.
    if (
      exchangeError.message.includes('PKCE') ||
      exchangeError.message.includes('code verifier') ||
      (exchangeError as any).code === 'pkce_code_verifier_not_found'
    ) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', exchangeError.message || 'Invalid or expired confirmation link.');
    return NextResponse.redirect(loginUrl);
  }

  // 4. Fallback: check if session already exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'Missing confirmation code. Please try signing in.');
  return NextResponse.redirect(loginUrl);
}
