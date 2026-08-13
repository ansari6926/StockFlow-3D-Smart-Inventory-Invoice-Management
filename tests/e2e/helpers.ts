import { Page } from '@playwright/test';

export const TEST_EMAIL = process.env.TEST_EMAIL || 'demo@stockflow.app';
export const TEST_PASSWORD = process.env.TEST_PASSWORD || 'StockFlow2024!';
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

export async function loginViaApi(page: Page) {
  // Direct login via filling form
  await login(page);
}
