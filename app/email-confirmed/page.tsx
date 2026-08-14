import Link from 'next/link';
import { CheckCircle2, Boxes, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function EmailConfirmedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-2xl space-y-6">
          {/* Brand Logo & Success Icon */}
          <div className="flex justify-center items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg">
              <Boxes className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Confirmed Successfully</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Your email has been successfully verified. Your StockFlow account is ready to manage your business inventory and invoices.
            </p>
          </div>

          <Button variant="gradient" size="lg" className="w-full" asChild>
            <Link href="/login" id="continue-to-signin">
              Continue to Sign In <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
