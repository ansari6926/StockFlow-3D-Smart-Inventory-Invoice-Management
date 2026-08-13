import { test, expect } from '@playwright/test';

test.describe('Authentication & Navigation', () => {
  test('landing page loads without assessment or demo labels', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Stop Overselling');

    // Verify Tactive label and demo credentials are NOT visible on public landing page
    await expect(page.locator('text=Tactive Assessment')).not.toBeVisible();
    await expect(page.locator('text=Demo Login')).not.toBeVisible();
    await expect(page.locator('text=demo@stockflow.app')).not.toBeVisible();

    // Verify Sign In and Get Started buttons exist in header
    await expect(page.locator('#nav-signin-btn')).toBeVisible();
    await expect(page.locator('#nav-getstarted-btn')).toBeVisible();
  });

  test('Sign In button navigates to Sign In page', async ({ page }) => {
    await page.goto('/');
    await page.click('#nav-signin-btn');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Welcome back');

    // Verify fields are empty and no demo credentials UI exists
    await expect(page.locator('#email')).toHaveValue('');
    await expect(page.locator('#password')).toHaveValue('');
    await expect(page.locator('text=Demo Credentials')).not.toBeVisible();
    await expect(page.locator('#fill-demo-credentials')).not.toBeVisible();
  });

  test('Get Started button navigates to Sign Up page', async ({ page }) => {
    await page.goto('/');
    await page.click('#nav-getstarted-btn');
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator('h1')).toContainText('Create your account');

    // Verify fields are empty
    await expect(page.locator('#signup-email')).toHaveValue('');
    await expect(page.locator('#signup-password')).toHaveValue('');
    await expect(page.locator('#signup-confirm-password')).toHaveValue('');
  });

  test('Sign Up validates password mismatch', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('#signup-email', 'testuser@example.com');
    await page.fill('#signup-password', 'password123');
    await page.fill('#signup-confirm-password', 'mismatch123');
    await page.click('#signup-submit');

    await expect(page.locator('[role="alert"]')).toContainText('Passwords do not match');
  });

  test('redirects unauthenticated users from protected dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('redirects unauthenticated users from protected inventory', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
