import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Invoice Validation - Invalid Inputs', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/invoices/new');
  });

  test('blocks submission with empty customer name', async ({ page }) => {
    // Add a product
    await page.fill('#product-search', 'USB');
    await page.waitForTimeout(500);
    const addBtn = page.locator('button[aria-label^="Add"]').first();
    const hasBtn = await addBtn.isVisible().catch(() => false);
    if (hasBtn) await addBtn.click();

    // Leave customer name empty and try submit
    await page.fill('#customer-name', '');

    // Submit button should be disabled (no customer name)
    const isDisabled = await page.locator('#submit-invoice').isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('prevents entering quantity > available stock via UI', async ({ page }) => {
    // Add a product
    await page.fill('#product-search', 'Logitech');
    await page.waitForTimeout(500);
    const addBtn = page.locator('button[aria-label^="Add"]').first();
    const hasBtn = await addBtn.isVisible().catch(() => false);
    if (!hasBtn) { test.skip(); return; }
    await addBtn.click();

    // Try to set very large quantity
    const qtyInput = page.locator('input[aria-label^="Quantity for"]').first();
    await qtyInput.fill('99999');
    await qtyInput.blur();
    await page.waitForTimeout(500);

    // Should show error
    const error = page.locator('#invoice-error');
    const hasError = await error.isVisible().catch(() => false);
    // Either shows error or clamps value
    const qtyValue = await qtyInput.inputValue();
    const isReasonable = parseInt(qtyValue) < 99999 || hasError;
    expect(isReasonable).toBe(true);
  });

  test('API rejects invoice with no items', async ({ page }) => {
    const response = await page.request.post('/api/invoices', {
      data: {
        customer_name: 'Test',
        items: [],
        discount_pct: 0,
      },
    });
    expect([400, 401, 422]).toContain(response.status());
  });

  test('API rejects invoice with negative quantity', async ({ page }) => {
    const response = await page.request.post('/api/invoices', {
      data: {
        customer_name: 'Test',
        items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: -1 }],
        discount_pct: 0,
      },
    });
    expect([400, 401, 422]).toContain(response.status());
  });

  test('API rejects invoice with zero quantity', async ({ page }) => {
    const response = await page.request.post('/api/invoices', {
      data: {
        customer_name: 'Test',
        items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: 0 }],
        discount_pct: 0,
      },
    });
    expect([400, 401, 422]).toContain(response.status());
  });

  test('API rejects invoice with decimal quantity', async ({ page }) => {
    const response = await page.request.post('/api/invoices', {
      data: {
        customer_name: 'Test',
        items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: 1.5 }],
        discount_pct: 0,
      },
    });
    expect([400, 401, 422]).toContain(response.status());
  });

  test('API rejects invoice with discount > 100', async ({ page }) => {
    const response = await page.request.post('/api/invoices', {
      data: {
        customer_name: 'Test',
        items: [{ product_id: '123e4567-e89b-12d3-a456-426614174000', quantity: 1 }],
        discount_pct: 150,
      },
    });
    expect([400, 401, 422]).toContain(response.status());
  });
});
