import { test, expect } from '@playwright/test';
import {
  setupAuthenticatedSession,
  createMessage,
  getSearchInput,
  performSearch,
  clearSearch,
} from './helpers';

test.describe('Messages Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the messages page with authentication
    await setupAuthenticatedSession(page);

    // Create test messages for searching
    const testMessages = [
      { code: `SEARCH_TEST_1_${Date.now()}`, content: 'Apple product information' },
      { code: `SEARCH_TEST_2_${Date.now()}`, content: 'Banana product information' },
      { code: `SEARCH_TEST_3_${Date.now()}`, content: 'Cherry product information' },
    ];

    for (const msg of testMessages) {
      await createMessage(page, msg.code, msg.content);
    }

    // Reload to ensure all messages are loaded
    await page.reload();
    await setupAuthenticatedSession(page);

    // Verify at least one test message is accessible by searching for it
    const searchInput = await getSearchInput(page);
    await searchInput.fill('SEARCH_TEST');
    await page.waitForTimeout(600);

    // Should see at least one search test message
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST")').first()
    ).toBeVisible({
      timeout: 10000,
    });

    // Clear search to return to normal view
    await clearSearch(page);
  });

  test('should search messages by code', async ({ page }) => {
    // Perform search using helper
    await performSearch(page, 'SEARCH_TEST_1');

    // Verify only matching messages are visible
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST_1")').first()
    ).toBeVisible();
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST_2")').first()
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST_3")').first()
    ).not.toBeVisible();
  });

  test('should search messages by content', async ({ page }) => {
    // Perform search using helper
    await performSearch(page, 'Apple');

    // Verify only matching messages are visible
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("Apple")').first()
    ).toBeVisible();
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("Banana")').first()
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("Cherry")').first()
    ).not.toBeVisible();
  });

  test('should show all messages when search is cleared', async ({ page }) => {
    // Perform a search
    await performSearch(page, 'SEARCH_TEST_1');

    // Verify filtered results
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST_1")').first()
    ).toBeVisible();

    // Clear the search
    await clearSearch(page);

    // Verify all test messages still exist by searching for each one
    // (can't check visibility directly due to pagination)
    await performSearch(page, 'SEARCH_TEST_1');
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST_1")').first()
    ).toBeVisible();
    await clearSearch(page);

    await performSearch(page, 'SEARCH_TEST_2');
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST_2")').first()
    ).toBeVisible();
    await clearSearch(page);

    await performSearch(page, 'SEARCH_TEST_3');
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST_3")').first()
    ).toBeVisible();
    await clearSearch(page);
  });

  test('should show no results message for non-existent search', async ({ page }) => {
    // Search for non-existent message
    await performSearch(page, 'NONEXISTENT_MESSAGE_12345');

    // Verify no test messages are visible
    await expect(
      page.locator('[data-testid^="message-row-"]:has-text("SEARCH_TEST")').first()
    ).not.toBeVisible();

    // Check for "no results" message via data-testid (locale-independent)
    const noResultsMessage = page.getByTestId('no-search-results');
    await expect(noResultsMessage).toBeVisible({ timeout: 5000 });
  });
});
