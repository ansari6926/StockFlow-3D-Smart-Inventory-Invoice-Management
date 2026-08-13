import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInvoiceById } from '@/lib/actions/invoices';
import { formatCurrency, formatDatetime } from '@/lib/utils';
import { CancelInvoiceButton } from '@/components/invoices/CancelInvoiceButton';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Invoice Detail' };

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: invoice, error } = await getInvoiceById(id);

  if (error || !invoice) notFound();

  return (
    <div>
      <Navbar title={invoice.invoice_number} subtitle="Invoice detail" />
      <div className="p-6 space-y-4 max-w-4xl">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Link>
        </Button>

        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-mono">{invoice.invoice_number}</h2>
                <p className="text-muted-foreground mt-1">Customer: <strong className="text-foreground">{invoice.customer_name}</strong></p>
                <p className="text-sm text-muted-foreground mt-0.5">{formatDatetime(invoice.created_at)}</p>
                {invoice.notes && <p className="text-sm text-muted-foreground mt-1">Notes: {invoice.notes}</p>}
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3">
                <Badge variant={invoice.status === 'PAID' ? 'success' : 'cancelled'} className="text-sm px-3 py-1">
                  {invoice.status}
                </Badge>
                {invoice.status === 'PAID' && (
                  <CancelInvoiceButton invoiceId={invoice.id} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Invoice items">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Unit Price</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.invoice_items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.product?.name ?? 'Unknown Product'}</p>
                        <p className="text-xs text-muted-foreground">{item.product?.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="p-6">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-orange-500">-{formatCurrency(invoice.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold text-lg">
                <span>Total</span>
                <span className="gradient-text-blue">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
