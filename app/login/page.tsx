'use client';

import { useState, useTransition, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Boxes, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam) {
      setError(errParam);
    }
  }, [searchParams]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const email = (formData.get('email') as string) || '';
    const password = (formData.get('password') as string) || '';

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await login({ email, password });
        if (result?.error) {
          setError(result.error);
        }
      } catch (err: any) {
        console.error('Login submit error:', err);
        setError(err?.message || 'Failed to sign in. Please try again.');
      }
    });
  }

  return (
    <form action={handleSubmit} className="p-8 space-y-5">
      {/* Error banner */}
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
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="email"
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
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
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

      {/* Submit Button */}
      <Button
        id="login-submit"
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full mt-2"
        loading={isPending}
      >
        Sign In
      </Button>

      {/* Sign Up Redirect Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" id="to-signup-link" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-border p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-xl">
              <Boxes className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to StockFlow 3D</p>
          </div>

          <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
