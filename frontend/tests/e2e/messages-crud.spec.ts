import { test, expect } from '@playwright/test';
import {
  setupAuthenticatedSession,
  fillMessageForm,
  openCreateModal,
  saveModalForm,
  waitForModalToClose,
  createMessage,
  editMessage,
  deleteMessage,
} from './helpers';

test.describe('Messages CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the messages page with authentication
    await setupAuthenticatedSession(page);
  });

  test('should create a new message', async ({ page }) => {
    const timestamp = Date.now();
    const code = `TEST_${timestamp}`;
    const content = `Test message ${timestamp}`;

    // Open create modal
    await openCreateModal(page);

    // Fill in the form using helper function
    await fillMessageForm(page, { code, content });

    // Submit the form
    await saveModalForm(page);

    // Wait for modal to close
    await waitForModalToClose(page);

    // Wait for the list to update
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Search for the message to verify it was created (handles pagination)
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill(code);
    await page.waitForTimeout(600);

    const row = page.locator(`[data-testid^="message-row-"]:has-text("${code}")`).first();
    await expect(row).toBeVisible({ timeout: 10000 });
  });

  test('should edit an existing message', async ({ page }) => {
    // First, create a message to edit
    const timestamp = Date.now();
    const originalCode = `EDIT_${timestamp}`;
    const originalContent = `Original ${timestamp}`;

    // Create message using helper
    await createMessage(page, originalCode, originalContent);

    // Edit the message using helper
    const updatedContent = `Updated ${Date.now()}`;
    await editMessage(page, originalCode, updatedContent);

    // Search for the message by code to verify it was updated (handles pagination)
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill(originalCode);
    await page.waitForTimeout(600);

    // Verify the updated content appears in the table
    const rowWithUpdatedContent = page
      .locator(`[data-testid^="message-row-"]:has-text("${updatedContent}")`)
      .first();
    await expect(rowWithUpdatedContent).toBeVisible();
  });

  test('should delete a message', async ({ page }) => {
    // First, create a message to delete
    const timestamp = Date.now();
    const code = `DELETE_${timestamp}`;
    const content = `Delete ${timestamp}`;

    // Create message using helper
    await createMessage(page, code, content);

    // Delete the message using helper
    await deleteMessage(page, code);

    // Search for the deleted message to verify it's gone (handles pagination)
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill(code);
    await page.waitForTimeout(600);

    // Verify the message is no longer in the table
    const deletedRow = page.locator(`[data-testid^="message-row-"]:has-text("${code}")`).first();
    await expect(deletedRow).not.toBeVisible();
  });

  test('should prevent duplicate codes', async ({ page }) => {
    // Create first message
    const timestamp = Date.now();
    const duplicateCode = `DUP_${timestamp}`;

    await createMessage(page, duplicateCode, 'First message');

    // Try to create another message with same code
    await openCreateModal(page);
    await fillMessageForm(page, { code: duplicateCode, content: 'Second message' });
    await saveModalForm(page);

    // Modal should stay open due to duplicate error
    await page.waitForTimeout(1000);
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
  });
});
