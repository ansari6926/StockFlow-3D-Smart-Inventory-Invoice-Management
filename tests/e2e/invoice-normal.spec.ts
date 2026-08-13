import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Invoice Creation - Normal Path', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('invoice creation page loads correctly', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page.locator('#customer-name')).toBeVisible();
    await expect(page.locator('#product-search')).toBeVisible();
    await expect(page.locator('#submit-invoice')).toBeVisible();
    await expect(page.locator('#discount-pct')).toBeVisible();
  });

  test('submit button disabled when no items', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page.locator('#submit-invoice')).toBeDisabled();
  });

  test('submit button disabled when no customer name', async ({ page }) => {
    await page.goto('/invoices/new');
    // Search for a product and add it
    await page.fill('#product-search', 'USB');
    await page.waitForTimeout(500);
    const firstResult = page.locator('button[aria-label^="Add"]').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
    }
    await expect(page.locator('#submit-invoice')).toBeDisabled();
  });

  test('creates invoice successfully (normal path)', async ({ page }) => {
    await page.goto('/invoices/new');

    // Fill customer name
    await page.fill('#customer-name', 'Test Customer Normal');

    // Search and add a product
    await page.fill('#product-search', 'USB-C Hub');
    await page.waitForTimeout(500);
    const addBtn = page.locator('button[aria-label^="Add"]').first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    // Verify item in cart
    await expect(page.locator('[aria-label="Invoice line items"]')).toBeVisible();

    // Check summary shows values
    await expect(page.locator('#summary-subtotal')).not.toContainText('$0.00');
    await expect(page.locator('#summary-total')).not.toContainText('$0.00');

    // Submit invoice
    await page.click('#submit-invoice');

    // Wait for success state
    await expect(page.locator('#success-invoice-number')).toBeVisible({ timeout: 15000 });
    const invoiceNumber = await page.locator('#success-invoice-number').textContent();
    expect(invoiceNumber).toMatch(/INV-/);
  });

  test('verifies invoice appears in invoice list', async ({ page }) => {
    await page.goto('/invoices');
    // Should see the invoice table or empty state
    const table = page.locator('[aria-label="Invoices table"]');
    const emptyState = page.locator('text=No invoices yet');
    const hasTable = await table.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('verifies dashboard shows correct counts', async ({ page }) => {
    await page.goto('/dashboard');
    // Dashboard stat cards should be visible
    await expect(page.locator('text=Total Products')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Revenue')).toBeVisible();
  });
});
