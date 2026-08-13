import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function formatDatetime(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function calculateInvoiceTotals(
  items: { quantity: number; unit_price: number }[],
  discountPct: number,
  taxRatePct: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discount = Math.round(subtotal * (discountPct / 100) * 100) / 100;
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * (taxRatePct / 100) * 100) / 100;
  const total = taxable + tax;
  return { subtotal, discount, tax, total };
}

export function isLowStock(product: { stock_quantity: number; reorder_threshold: number }): boolean {
  return product.stock_quantity <= product.reorder_threshold;
}

export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `INV-${timestamp}`;
}

export function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}
