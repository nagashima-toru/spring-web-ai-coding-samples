import { test, expect } from '@playwright/test';
import { login, waitForFrontend, createMessage } from './helpers';

/**
 * E2E tests for VIEWER readonly modal behavior.
 * Button visibility tests (create/edit/delete) are covered by Unit tests (usePermission hook).
 */
test.describe('Permission UI - VIEWER Role', () => {
  test.beforeEach(async ({ page }) => {
    // Login as VIEWER user
    await login(page, 'viewer', 'viewer123');
    await waitForFrontend(page);
  });

  test('should open readonly modal when clicking on a message row', async ({ page }) => {
    // Wait for the table to load
    await page.waitForTimeout(1000);

    // Find a message row to click
    const messageRows = page.locator('[data-testid^="message-row-"]');
    const rowCount = await messageRows.count();

    if (rowCount > 0) {
      const firstRow = messageRows.first();
      await expect(firstRow).toBeVisible();

      // Click on the row (not on any button)
      await firstRow.click();

      // Wait for modal to open
      const modal = page.getByTestId('message-modal');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify form fields are visible but disabled
      const codeInput = page.getByTestId('message-code-input');
      const contentInput = page.getByTestId('message-content-input');

      await expect(codeInput).toBeVisible();
      await expect(codeInput).toBeDisabled();
      await expect(contentInput).toBeVisible();
      await expect(contentInput).toBeDisabled();

      // Verify submit button is NOT visible in readonly mode
      const submitButton = page.getByTestId('message-form-submit');
      await expect(submitButton).not.toBeVisible();

      // Close the modal
      const cancelButton = page.getByTestId('message-form-cancel');
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();

      // Wait for modal to close
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should display all form fields as disabled in readonly modal', async ({ page }) => {
    // This test uses an ADMIN user to create a test message first,
    // then logs in as VIEWER to verify readonly access

    // First, create a test message as ADMIN
    const adminPage = await page.context().newPage();
    await login(adminPage, 'admin', 'admin123');
    await waitForFrontend(adminPage);

    const timestamp = Date.now();
    const testCode = `VIEWER_TEST_${timestamp}`;
    const testContent = `Readonly test ${timestamp}`;
    await createMessage(adminPage, testCode, testContent);
    await adminPage.close();

    // Re-login as VIEWER because adminPage login overwrote the localStorage token
    // (both pages share the same browser context and localStorage)
    await login(page, 'viewer', 'viewer123');
    await waitForFrontend(page);

    // Now, as VIEWER, search for this message
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill(testCode);
    await page.waitForTimeout(600);

    // Click on the message row
    const row = page.locator(`[data-testid^="message-row-"]:has-text("${testCode}")`).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.click();

    // Wait for modal to open
    const modal = page.getByTestId('message-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Verify all form fields are disabled
    const codeInput = page.getByTestId('message-code-input');
    const contentInput = page.getByTestId('message-content-input');

    await expect(codeInput).toBeDisabled();
    await expect(contentInput).toBeDisabled();

    // Verify the content matches what was created
    await expect(codeInput).toHaveValue(testCode);
    await expect(contentInput).toHaveValue(testContent);

    // Verify submit button is not visible
    const submitButton = page.getByTestId('message-form-submit');
    await expect(submitButton).not.toBeVisible();

    // Verify cancel button is visible (acts as "Close" in readonly mode)
    const cancelButton = page.getByTestId('message-form-cancel');
    await expect(cancelButton).toBeVisible();
  });
});
