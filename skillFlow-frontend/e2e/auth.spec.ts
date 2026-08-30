import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Flow', () => {
  test('navigates from home to login page and displays login form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Project 0');

    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2')).toContainText('Welcome Back to Project 0');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
