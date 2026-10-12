import { test, expect, type Page } from '@playwright/test';
import { login } from './helpers';

// Helper: clear locale from localStorage and navigate to login page
async function clearLocale(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('locale'));
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('language-switcher')).toBeVisible({ timeout: 10000 });
}

// Helper: switch to English (click button when in Japanese mode, wait for DOM change)
async function switchToEnglish(page: Page) {
  const switcher = page.getByTestId('language-switcher');
  await expect(switcher).toBeVisible({ timeout: 5000 });
  // Button shows "🌐 日本語" when locale is 'ja'
  if ((await switcher.textContent())?.includes('🌐 日本語')) {
    await switcher.click();
    // Wait until the button changes to "🌐 English" (locale is now 'en')
    await expect(switcher).toHaveText('🌐 English', { timeout: 3000 });
  }
}

test.describe('言語切り替え機能', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocale(page);
  });

  test('メイン画面に言語切り替えボタンが表示される', async ({ page }) => {
    await login(page);
    await expect(page.getByTestId('language-switcher')).toBeVisible({ timeout: 10000 });
  });

  test('ログイン後も選択言語が引き継がれる', async ({ page }) => {
    // Select English on login page
    await switchToEnglish(page);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

    // Login
    await page.getByTestId('login-username-input').fill('admin');
    await page.getByTestId('login-password-input').fill('admin123');
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Main page should be in English
    await expect(page.getByRole('heading', { name: 'Message Management' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('language-switcher')).toHaveText('🌐 English'); // Shows "🌐 English" when in English mode
  });

  test('ログアウト後も選択言語が引き継がれる', async ({ page }) => {
    // Login first
    await login(page);
    await page.waitForLoadState('networkidle');

    // Switch to English on main page
    await switchToEnglish(page);
    await expect(page.getByRole('heading', { name: 'Message Management' })).toBeVisible();

    // Logout
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await page.waitForURL('/login', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Login page should still be in English
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('language-switcher')).toHaveText('🌐 English'); // Shows "🌐 English" when in English mode
  });
});
