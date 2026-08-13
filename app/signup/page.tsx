'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Boxes, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signUp } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ email: string; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const password = (formData.get('password') as string) || '';
    const confirmPassword = (formData.get('confirmPassword') as string) || '';

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
        const result = await signUp(formData, origin);

        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          setSuccessInfo({
            email: result.email || (formData.get('email') as string),
            message: result.message || 'Check your email for a confirmation link.',
          });
        }
      } catch (err: any) {
        console.error('SignUp form submit error:', err);
        setError(err?.message || 'Failed to submit sign up. Please try again.');
      }
    });
  }

  if (successInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-2xl space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We&apos;ve sent a confirmation link to{' '}
                <strong className="text-foreground">{successInfo.email}</strong>. Please verify your email address
                before signing in.
              </p>
            </div>
            <Button variant="gradient" className="w-full" asChild>
              <Link href="/login" id="back-to-signin">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-border p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-xl">
              <Boxes className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start managing your inventory with StockFlow 3D</p>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="p-8 space-y-4">
            {/* Error Banner */}
            {error && (
              <div
                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Create a password (min 6 characters)"
                  className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-foreground mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              id="signup-submit"
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full mt-2"
              loading={isPending}
            >
              Create Account
            </Button>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" id="to-login-link" className="font-semibold text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
