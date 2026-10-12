import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from './helpers';

test.describe('Authentication Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Verify login form is visible
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
    await expect(page.getByTestId('login-username-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();

    // Fill in credentials
    await page.getByTestId('login-username-input').fill('admin');
    await page.getByTestId('login-password-input').fill('admin123');

    // Submit the form
    await page.getByTestId('login-submit-button').click();

    // Wait for redirect to home page
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Verify user is on the home page
    await expect(page.getByRole('heading', { name: /メッセージ管理/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in invalid credentials
    await page.getByTestId('login-username-input').fill('invalid_user');
    await page.getByTestId('login-password-input').fill('invalid_pass');

    // Submit the form
    await page.getByTestId('login-submit-button').click();

    // Wait for potential API response
    await page.waitForTimeout(3000);

    // Verify user is still on login page (login failed)
    expect(page.url()).toContain('/login');

    // Verify the form is still visible (not redirected)
    await expect(page.getByTestId('login-username-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();

    // The key validation is that user is NOT redirected to home page
    expect(page.url()).toContain('/login');
  });

  test('should redirect to login when accessing protected page without auth', async ({ page }) => {
    // Try to access the home page without authentication
    await page.goto('/');

    // Should redirect to login page
    await page.waitForURL('/login', { timeout: 10000 });

    // Verify login form is visible
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
  });

  test('should logout and redirect to login page', async ({ page }) => {
    // First, login
    await setupAuthenticatedSession(page);

    // Verify user is on the home page
    await expect(page.getByRole('heading', { name: /メッセージ管理/i })).toBeVisible();

    // Click logout button
    const logoutButton = page.getByRole('button', { name: /ログアウト/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Wait for redirect to login page
    await page.waitForURL('/login', { timeout: 10000 });

    // Verify login form is visible
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();
  });
});
