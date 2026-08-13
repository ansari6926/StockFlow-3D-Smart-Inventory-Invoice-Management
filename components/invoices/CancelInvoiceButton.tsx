'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cancelInvoice } from '@/lib/actions/invoices';

export function CancelInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelInvoice(invoiceId);
      if (result.error) {
        setError(result.error);
        setShowConfirm(false);
      } else {
        router.refresh();
        setShowConfirm(false);
      }
    });
  }

  if (!showConfirm) {
    return (
      <div className="space-y-2">
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          id="cancel-invoice-btn"
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => setShowConfirm(true)}
        >
          <XCircle className="h-4 w-4" /> Cancel Invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3 max-w-xs">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-destructive">Cancel this invoice?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Stock will be restored. This action cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)} disabled={isPending}>
          Keep Invoice
        </Button>
        <Button
          id="confirm-cancel-invoice"
          variant="destructive"
          size="sm"
          loading={isPending}
          onClick={handleCancel}
        >
          Yes, Cancel
        </Button>
      </div>
    </div>
  );
}
