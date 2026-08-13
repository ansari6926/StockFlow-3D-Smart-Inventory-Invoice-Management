import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, PlusCircle, Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInvoices } from '@/lib/actions/invoices';
import { formatCurrency, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Invoices' };

export default async function InvoicesPage() {
  const { data: invoices, error } = await getInvoices();

  return (
    <div>
      <Navbar title="Invoices" subtitle="Invoice history & tracking" />
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{invoices?.length ?? 0}</strong> total invoices
            </p>
          </div>
          <Button variant="gradient" asChild>
            <Link href="/invoices/new" id="invoices-page-new-btn">
              <PlusCircle className="h-4 w-4" /> New Invoice
            </Link>
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Table Card */}
        <Card>
          <CardContent className="p-0">
            {!invoices || invoices.length === 0 ? (
              <div className="py-20 text-center">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-semibold">No invoices yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Create your first invoice to get started.</p>
                <Button variant="gradient" className="mt-6" asChild>
                  <Link href="/invoices/new">Create Invoice</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Invoices table">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Invoice #</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Subtotal</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="table-row-hover">
                        <td className="px-4 py-3">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-mono text-sm font-semibold text-primary hover:underline"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-medium">{invoice.customer_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(invoice.created_at)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(invoice.subtotal)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(invoice.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={invoice.status === 'PAID' ? 'success' : 'cancelled'}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/invoices/${invoice.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
