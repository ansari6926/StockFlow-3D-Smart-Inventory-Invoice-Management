import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotals } from '@/lib/utils';
import { TAX_RATE_PCT } from '@/lib/constants';

describe('calculateInvoiceTotals', () => {
  const TAX = TAX_RATE_PCT; // 10

  it('calculates correct totals with no discount', () => {
    const items = [{ quantity: 2, unit_price: 100 }];
    const result = calculateInvoiceTotals(items, 0, TAX);
    expect(result.subtotal).toBe(200);
    expect(result.discount).toBe(0);
    expect(result.tax).toBe(20);
    expect(result.total).toBe(220);
  });

  it('calculates correct totals with 10% discount', () => {
    const items = [{ quantity: 1, unit_price: 1000 }];
    const result = calculateInvoiceTotals(items, 10, TAX);
    expect(result.subtotal).toBe(1000);
    expect(result.discount).toBe(100);
    expect(result.tax).toBe(90); // 10% of (1000 - 100) = 90
    expect(result.total).toBe(990); // 1000 - 100 + 90
  });

  it('calculates correct totals with 100% discount', () => {
    const items = [{ quantity: 1, unit_price: 500 }];
    const result = calculateInvoiceTotals(items, 100, TAX);
    expect(result.subtotal).toBe(500);
    expect(result.discount).toBe(500);
    expect(result.tax).toBe(0); // 10% of 0 = 0
    expect(result.total).toBe(0); // 500 - 500 + 0
  });

  it('calculates correct totals with multiple items', () => {
    const items = [
      { quantity: 2, unit_price: 100 },
      { quantity: 3, unit_price: 50 },
    ];
    const result = calculateInvoiceTotals(items, 0, TAX);
    expect(result.subtotal).toBe(350); // 200 + 150
    expect(result.discount).toBe(0);
    expect(result.tax).toBe(35); // 10% of 350
    expect(result.total).toBe(385);
  });

  it('calculates correct totals with multiple items and discount', () => {
    const items = [
      { quantity: 1, unit_price: 2499 },
      { quantity: 2, unit_price: 99.99 },
    ];
    const result = calculateInvoiceTotals(items, 15, TAX);
    const expectedSubtotal = 2499 + 2 * 99.99; // 2698.98
    const expectedDiscount = Math.round(expectedSubtotal * 0.15 * 100) / 100;
    const taxable = expectedSubtotal - expectedDiscount;
    const expectedTax = Math.round(taxable * 0.1 * 100) / 100;
    const expectedTotal = taxable + expectedTax;
    expect(result.subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(result.discount).toBeCloseTo(expectedDiscount, 2);
    expect(result.tax).toBeCloseTo(expectedTax, 2);
    expect(result.total).toBeCloseTo(expectedTotal, 2);
  });

  it('handles empty items array', () => {
    const result = calculateInvoiceTotals([], 0, TAX);
    expect(result.subtotal).toBe(0);
    expect(result.discount).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });

  it('never returns negative total', () => {
    const items = [{ quantity: 1, unit_price: 100 }];
    const result = calculateInvoiceTotals(items, 100, 0);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('calculates correct totals with quantity = 1 (minimum)', () => {
    const items = [{ quantity: 1, unit_price: 2499 }];
    const result = calculateInvoiceTotals(items, 0, TAX);
    expect(result.subtotal).toBe(2499);
    expect(result.tax).toBe(249.9);
    expect(result.total).toBe(2748.9);
  });
});
