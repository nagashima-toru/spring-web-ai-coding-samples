import { test, expect } from '@playwright/test';
import {
  setupAuthenticatedSession,
  openCreateModal,
  fillMessageForm,
  saveModalForm,
} from './helpers';

test.describe('Messages Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the messages page with authentication
    await setupAuthenticatedSession(page);
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Try to create a message
    await openCreateModal(page);

    await fillMessageForm(page, {
      code: `OFFLINE_${Date.now()}`,
      content: 'Test content',
    });

    await saveModalForm(page);

    // Wait for error to potentially appear
    await page.waitForTimeout(2000);

    // Modal should stay open due to network error
    const modal = page.getByTestId('message-modal');
    await expect(modal).toBeVisible();

    // Restore online mode
    await context.setOffline(false);
  });
});
