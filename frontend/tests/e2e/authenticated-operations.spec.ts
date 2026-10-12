import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';

test.describe('Authenticated Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated session before each test
    await setupAuthenticatedSession(page);
  });

  test('should handle logout and prevent further operations', async ({ page }) => {
    // Verify user is authenticated
    await expect(page.getByRole('heading', { name: /メッセージ管理/i })).toBeVisible();

    // Logout
    const logoutButton = page.getByRole('button', { name: /ログアウト/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Wait for redirect to login page
    await page.waitForURL('/login', { timeout: 10000 });

    // Try to navigate back to protected page
    await page.goto('/');

    // Should be redirected back to login
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
  });
});
