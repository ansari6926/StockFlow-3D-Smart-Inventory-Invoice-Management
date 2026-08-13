'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowLeft,
  ShoppingCart,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/actions/products';
import { createInvoice } from '@/lib/actions/invoices';
import { formatCurrency, calculateInvoiceTotals, isLowStock } from '@/lib/utils';
import { TAX_RATE_PCT } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface LineItem {
  product: Product;
  quantity: number;
  line_total: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discountPct, setDiscountPct] = useState(0);

  // Product search
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Submission state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ invoiceNumber: string; total: number } | null>(null);

  useEffect(() => {
    getProducts().then(({ data }) => {
      if (data) setProducts(data);
      setLoadingProducts(false);
    });
  }, []);

  // ======================================================
  // Computed values
  // ======================================================
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  // Current stock available for a product (accounting for items already in cart)
  function availableStock(product: Product): number {
    const inCart = lineItems.find((li) => li.product.id === product.id)?.quantity ?? 0;
    return product.stock_quantity - inCart;
  }

  const totals = calculateInvoiceTotals(
    lineItems.map((li) => ({ quantity: li.quantity, unit_price: li.product.price })),
    discountPct,
    TAX_RATE_PCT
  );

  // ======================================================
  // Actions
  // ======================================================
  function addProduct(product: Product) {
    const existing = lineItems.find((li) => li.product.id === product.id);
    if (existing) {
      // Increase quantity by 1 if stock allows
      if (existing.quantity >= product.stock_quantity) {
        setError(`Only ${product.stock_quantity} units of "${product.name}" are currently available.`);
        return;
      }
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      if (product.stock_quantity <= 0) {
        setError(`"${product.name}" is out of stock.`);
        return;
      }
      setLineItems((prev) => [
        ...prev,
        {
          product,
          quantity: 1,
          line_total: product.price,
        },
      ]);
    }
    setSearchQuery('');
    setShowProductSearch(false);
    setError(null);
  }

  function updateQuantity(productId: string, newQty: number) {
    setError(null);
    setLineItems((prev) =>
      prev.map((li) => {
        if (li.product.id !== productId) return li;
        const product = li.product;

        // Validate
        if (!Number.isInteger(newQty)) {
          setError('Quantity must be a whole number.');
          return li;
        }
        if (newQty <= 0) {
          setError('Quantity must be at least 1.');
          return li;
        }
        if (newQty > product.stock_quantity) {
          setError(
            `Only ${product.stock_quantity} unit${product.stock_quantity !== 1 ? 's' : ''} of "${product.name}" are currently available.`
          );
          return { ...li, quantity: product.stock_quantity, line_total: product.price * product.stock_quantity };
        }

        return {
          ...li,
          quantity: newQty,
          line_total: product.price * newQty,
        };
      })
    );
  }

  function removeItem(productId: string) {
    setLineItems((prev) => prev.filter((li) => li.product.id !== productId));
    setError(null);
  }

  function handleDiscountChange(value: string) {
    const num = parseFloat(value);
    if (isNaN(num)) { setDiscountPct(0); return; }
    if (num < 0) { setDiscountPct(0); return; }
    if (num > 100) { setDiscountPct(100); return; }
    setDiscountPct(num);
  }

  // ======================================================
  // Validation
  // ======================================================
  function validate(): string | null {
    if (!customerName.trim()) return 'Customer name is required.';
    if (lineItems.length === 0) return 'Please add at least one item.';
    for (const li of lineItems) {
      if (li.quantity <= 0) return `Quantity for "${li.product.name}" must be greater than 0.`;
      if (!Number.isInteger(li.quantity)) return `Quantity for "${li.product.name}" must be a whole number.`;
      if (li.quantity > li.product.stock_quantity) {
        return `Only ${li.product.stock_quantity} units of "${li.product.name}" are available.`;
      }
    }
    if (discountPct < 0 || discountPct > 100) return 'Discount must be between 0 and 100%.';
    return null;
  }

  // ======================================================
  // Submit
  // ======================================================
  function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createInvoice({
        customer_name: customerName.trim(),
        items: lineItems.map((li) => ({
          product_id: li.product.id,
          quantity: li.quantity,
        })),
        discount_pct: discountPct,
        notes: notes.trim(),
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setSuccess({
          invoiceNumber: result.data.invoice_number,
          total: result.data.total,
        });
      }
    });
  }

  // ======================================================
  // Success State
  // ======================================================
  if (success) {
    return (
      <div>
        <Navbar title="Invoice Created" subtitle="Transaction complete" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Invoice Created!</h2>
              <p className="text-muted-foreground mt-1">Stock has been deducted from inventory.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Invoice Number</span>
                <span className="font-mono font-bold text-primary" id="success-invoice-number">{success.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Total Charged</span>
                <span className="font-bold text-lg gradient-text-blue" id="success-total">{formatCurrency(success.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Customer</span>
                <span className="font-medium">{customerName}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/invoices">View All Invoices</Link>
              </Button>
              <Button variant="gradient" className="flex-1" onClick={() => {
                setSuccess(null);
                setLineItems([]);
                setCustomerName('');
                setNotes('');
                setDiscountPct(0);
              }}>
                New Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // Main Form
  // ======================================================
  return (
    <div>
      <Navbar title="New Invoice" subtitle="Create invoice from inventory" />
      <div className="p-6 space-y-4 max-w-5xl">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        {/* Error */}
        {error && (
          <div
            id="invoice-error"
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
            role="alert"
          >
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* LEFT: Product selection + Line items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label htmlFor="customer-name" className="block text-sm font-medium mb-1">
                    Customer Name *
                  </label>
                  <input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="invoice-notes" className="block text-sm font-medium mb-1">
                    Notes (optional)
                  </label>
                  <input
                    id="invoice-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes for this invoice"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" /> Add Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="product-search"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowProductSearch(true); }}
                    onFocus={() => setShowProductSearch(true)}
                    placeholder="Search products by name, SKU, or category..."
                    aria-label="Search products"
                    className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Product Results */}
                {showProductSearch && searchQuery && (
                  <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    {loadingProducts ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">Loading products...</div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No products found for "{searchQuery}"
                      </div>
                    ) : (
                      filteredProducts.map((product) => {
                        const avail = availableStock(product);
                        const alreadyInCart = lineItems.some((li) => li.product.id === product.id);
                        const outOfStock = product.stock_quantity <= 0;
                        return (
                          <button
                            key={product.id}
                            onClick={() => addProduct(product)}
                            disabled={outOfStock}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors border-b border-border last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Add ${product.name} to invoice`}
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sku} · {product.category}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold">{formatCurrency(product.price)}</p>
                              <div className="flex items-center gap-1 justify-end">
                                <span className={`text-xs ${avail <= product.reorder_threshold ? 'text-orange-500' : 'text-muted-foreground'}`}>
                                  {avail} in stock
                                </span>
                                {alreadyInCart && <Badge variant="secondary" className="text-[10px]">In cart</Badge>}
                                {outOfStock && <Badge variant="destructive" className="text-[10px]">Out of stock</Badge>}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items Table */}
            {lineItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Invoice Items ({lineItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm" aria-label="Invoice line items">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Product</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Unit Price</th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Qty</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Line Total</th>
                        <th className="px-4 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {lineItems.map((li) => (
                        <tr key={li.product.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium">{li.product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{li.product.sku}</span>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground">
                                {li.product.stock_quantity} available
                              </span>
                              {isLowStock(li.product) && (
                                <Badge variant="warning" className="text-[10px] gap-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5" /> Low Stock
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatCurrency(li.product.price)}
                            <p className="text-[10px] text-muted-foreground/60">from database</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => updateQuantity(li.product.id, li.quantity - 1)}
                                disabled={li.quantity <= 1}
                                className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={li.product.stock_quantity}
                                value={li.quantity}
                                onChange={(e) => updateQuantity(li.product.id, parseInt(e.target.value) || 1)}
                                className="w-14 h-8 text-center rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label={`Quantity for ${li.product.name}`}
                              />
                              <button
                                onClick={() => updateQuantity(li.product.id, li.quantity + 1)}
                                disabled={li.quantity >= li.product.stock_quantity}
                                className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(li.line_total)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(li.product.id)}
                              aria-label={`Remove ${li.product.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT: Totals Panel */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Discount */}
                <div>
                  <label htmlFor="discount-pct" className="block text-sm font-medium mb-1.5">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <input
                      id="discount-pct"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={discountPct}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Discount percentage"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span id="summary-subtotal">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount ({discountPct}%)</span>
                    <span className="text-orange-500" id="summary-discount">-{formatCurrency(totals.discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({TAX_RATE_PCT}%)</span>
                    <span id="summary-tax">{formatCurrency(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                    <span>Total</span>
                    <span className="gradient-text-blue" id="summary-total">{formatCurrency(totals.total)}</span>
                  </div>
                </div>

                {/* Formula note */}
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  Price sourced from database · Tax applied after discount
                </p>

                {/* Items count */}
                {lineItems.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {lineItems.reduce((sum, li) => sum + li.quantity, 0)} unit{lineItems.reduce((sum, li) => sum + li.quantity, 0) !== 1 ? 's' : ''} across {lineItems.length} product{lineItems.length !== 1 ? 's' : ''}
                  </p>
                )}

                {/* Submit Button */}
                <Button
                  id="submit-invoice"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  loading={isPending}
                  onClick={handleSubmit}
                  disabled={lineItems.length === 0 || !customerName.trim() || isPending}
                >
                  {isPending ? 'Creating Invoice...' : 'Create Invoice'}
                </Button>

                {lineItems.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Add at least one product to create an invoice
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
