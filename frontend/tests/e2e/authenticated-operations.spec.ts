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

    // Try to navigate back to protected page.
    // After logout, a late 401 on the previous page can start another navigation to /login
    // and interrupt this goto, so retry until the navigation to / commits. Waiting only for
    // "commit" keeps the app's own redirect to /login from aborting the goto.
    await expect(async () => {
      await page.goto('/', { waitUntil: 'commit' });
    }).toPass({ timeout: 10000 });

    // Should be redirected back to login (toHaveURL polls, so the redirect may interrupt navigation)
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
  });
});
