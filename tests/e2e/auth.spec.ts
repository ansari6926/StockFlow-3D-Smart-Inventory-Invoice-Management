import { test, expect } from '@playwright/test';
import { TEST_EMAIL, TEST_PASSWORD } from './helpers';

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-submit')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('#login-submit');
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
  });

  test('redirects unauthenticated users from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('redirects unauthenticated users from inventory to login', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('redirects unauthenticated users from invoices to login', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('fills demo credentials', async ({ page }) => {
    await page.goto('/login');
    await page.click('#fill-demo-credentials');
    await expect(page.locator('#email')).toHaveValue(TEST_EMAIL);
    await expect(page.locator('#password')).toHaveValue(TEST_PASSWORD);
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('#login-submit');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });
});
