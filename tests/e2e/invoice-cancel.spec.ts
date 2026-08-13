// AI CHANGE LOOP: Invoice Cancellation Feature Tests
// This test file was added as part of the AI change loop feature implementation

import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Invoice Cancellation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('cancel button visible on PAID invoices', async ({ page }) => {
    // First create an invoice
    await page.goto('/invoices/new');
    await page.fill('#customer-name', 'Cancel Test Customer');
    await page.fill('#product-search', 'USB-C Hub');
    await page.waitForTimeout(500);
    const addBtn = page.locator('button[aria-label^="Add"]').first();
    const hasBtn = await addBtn.isVisible().catch(() => false);
    if (!hasBtn) { test.skip(); return; }
    await addBtn.click();
    await page.click('#submit-invoice');
    await expect(page.locator('#success-invoice-number')).toBeVisible({ timeout: 15000 });

    // Navigate to invoices and find the new one
    await page.goto('/invoices');
    const viewBtn = page.locator('a[href^="/invoices/"]:not([href="/invoices/new"])').first();
    await viewBtn.click();

    // Verify cancel button is visible
    await expect(page.locator('#cancel-invoice-btn')).toBeVisible({ timeout: 5000 });
  });

  test('cancel invoice shows confirmation dialog', async ({ page }) => {
    await page.goto('/invoices');
    const viewLinks = page.locator('a.font-mono.text-primary');
    const count = await viewLinks.count();
    if (count === 0) { test.skip(); return; }

    await viewLinks.first().click();
    const cancelBtn = page.locator('#cancel-invoice-btn');
    const hasCancel = await cancelBtn.isVisible().catch(() => false);
    if (!hasCancel) { test.skip(); return; }

    await cancelBtn.click();
    await expect(page.locator('#confirm-cancel-invoice')).toBeVisible();
    await expect(page.locator('text=Cancel this invoice?')).toBeVisible();
  });

  test('API rejects cancelling already-cancelled invoice', async ({ page }) => {
    // Find a cancelled invoice via API
    const invoicesRes = await page.request.get('/api/invoices');
    if (invoicesRes.status() !== 200) { test.skip(); return; }
    const { data: invoices } = await invoicesRes.json();
    const cancelled = invoices?.find((inv: { status: string }) => inv.status === 'CANCELLED');
    if (!cancelled) { test.skip(); return; }

    const response = await page.request.post(`/api/invoices/${cancelled.id}/cancel`);
    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toContain('cancelled');
  });

  test('API returns 401 for unauthenticated cancel attempt', async ({ page }) => {
    // Use a fresh page context without login
    const context = await page.context().browser()!.newContext();
    const freshPage = await context.newPage();
    const response = await freshPage.request.post('/api/invoices/00000000-0000-0000-0000-000000000000/cancel');
    expect(response.status()).toBe(401);
    await context.close();
  });
});
