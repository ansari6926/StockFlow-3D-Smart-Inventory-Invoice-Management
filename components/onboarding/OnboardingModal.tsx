'use client';

import { useState, useTransition } from 'react';
import { Boxes, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateProfileDisplayName } from '@/lib/actions/profile';

interface OnboardingModalProps {
  initialDisplayName?: string;
  userEmail?: string;
}

export function OnboardingModal({ initialDisplayName, userEmail }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(!initialDisplayName);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Please enter a display name.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProfileDisplayName(trimmed);
        if (result.error) {
          setError(result.error);
        } else {
          setIsOpen(false);
        }
      } catch (err: any) {
        console.error('Failed to save display name:', err);
        setError('Failed to save display name. Please try again.');
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-xl">
            <Boxes className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Welcome to StockFlow
            </div>
            <h2 className="text-2xl font-bold text-foreground">What should I call you?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This name will be used throughout your StockFlow workspace.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="onboarding-name" className="block text-xs font-medium text-foreground mb-1.5">
              Enter your name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="onboarding-name"
                type="text"
                required
                disabled={isPending}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Sabith"
                className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50"
                autoFocus
              />
            </div>
          </div>

          <Button
            id="onboarding-submit"
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            loading={isPending}
            disabled={isPending || !displayName.trim()}
          >
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
