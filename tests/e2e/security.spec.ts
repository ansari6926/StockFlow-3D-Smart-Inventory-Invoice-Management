import { test, expect } from '@playwright/test';

test.describe('Security - Unauthenticated Access', () => {
  test('GET /api/products returns 401 without auth', async ({ page }) => {
    const response = await page.request.get('/api/products');
    expect(response.status()).toBe(401);
  });

  test('POST /api/invoices returns 401 without auth', async ({ page }) => {
    const response = await page.request.post('/api/invoices', {
      data: { customer_name: 'Test', items: [], discount_pct: 0 },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /api/invoices returns 401 without auth', async ({ page }) => {
    const response = await page.request.get('/api/invoices');
    expect(response.status()).toBe(401);
  });

  test('POST /api/invoices/:id/cancel returns 401 without auth', async ({ page }) => {
    const response = await page.request.post('/api/invoices/00000000-0000-0000-0000-000000000000/cancel');
    expect(response.status()).toBe(401);
  });

  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('inventory redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/login/);
  });

  test('new invoice redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/invoices/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('health endpoint is public', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });
});
