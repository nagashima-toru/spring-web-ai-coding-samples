import { Page, Locator, expect } from '@playwright/test';

/**
 * Login to the application
 */
export async function login(page: Page, username = 'admin', password = 'admin123'): Promise<void> {
  // Listen for console messages to debug
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  // Navigate to login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Wait for login form to be ready
  await expect(page.getByTestId('login-username-input')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('login-password-input')).toBeVisible({ timeout: 10000 });

  // Fill in credentials using data-testid
  await page.getByTestId('login-username-input').fill(username);
  await page.getByTestId('login-password-input').fill(password);

  // Submit the form
  await page.getByTestId('login-submit-button').click();

  // Wait for navigation to complete (either success or error)
  await page.waitForTimeout(3000);

  // Check if we're still on login page (login failed) or redirected (login succeeded)
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    // Still on login page - check for error message
    const errorMessage = await page
      .getByRole('alert')
      .textContent()
      .catch(() => null);
    const consoleLog = consoleMessages.join('\n');
    if (errorMessage) {
      throw new Error(`Login failed: ${errorMessage}\nConsole: ${consoleLog}`);
    } else {
      throw new Error(
        `Login failed: No error message displayed but still on login page.\nConsole: ${consoleLog}`
      );
    }
  }

  // Wait for home page to fully load
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

/**
 * Wait for a modal/dialog to be visible and ready for interaction
 */
export async function waitForModal(page: Page): Promise<Locator> {
  const modal = page.getByTestId('message-modal');
  await expect(modal).toBeVisible({ timeout: 10000 });
  // Wait a bit for any animations to complete
  await page.waitForTimeout(300);
  return modal;
}

/**
 * Fill a form field with proper visibility and enabled checks
 * Handles both input and textarea elements
 */
export async function fillFormField(
  page: Page,
  fieldName: 'code' | 'content',
  value: string
): Promise<void> {
  // Use data-testid to identify form fields
  const testId = fieldName === 'content' ? 'message-content-input' : 'message-code-input';
  const field = page.getByTestId(testId);

  // Wait for field to be visible and enabled
  await expect(field).toBeVisible({ timeout: 10000 });
  await expect(field).toBeEnabled({ timeout: 5000 });

  // Clear and fill the field
  await field.clear();
  await field.fill(value);

  // Verify the value was set
  await expect(field).toHaveValue(value);
}

/**
 * Fill multiple form fields in a modal
 */
export async function fillMessageForm(
  page: Page,
  data: { code: string; content: string }
): Promise<void> {
  await fillFormField(page, 'code', data.code);
  await fillFormField(page, 'content', data.content);
}

/**
 * Get the search input locator
 * Uses data-testid for reliable element selection
 */
export async function getSearchInput(page: Page): Promise<Locator> {
  const searchInput = page.getByTestId('search-input');
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  return searchInput;
}

/**
 * Perform a search and wait for results to update
 */
export async function performSearch(page: Page, searchTerm: string): Promise<void> {
  const searchInput = await getSearchInput(page);
  await searchInput.clear();
  await searchInput.fill(searchTerm);

  // Wait for debounce (300ms) + a bit more for render
  await page.waitForTimeout(600);
}

/**
 * Clear search and wait for all results to return
 */
export async function clearSearch(page: Page): Promise<void> {
  const searchInput = await getSearchInput(page);
  await searchInput.clear();

  // Wait for debounce + render
  await page.waitForTimeout(600);
}

/**
 * Open the create message modal
 */
export async function openCreateModal(page: Page): Promise<Locator> {
  const newButton = page.getByTestId('create-message-button');
  await expect(newButton).toBeVisible({ timeout: 5000 });
  await newButton.click();

  return await waitForModal(page);
}

/**
 * Save the form in a modal
 */
export async function saveModalForm(page: Page): Promise<void> {
  const saveButton = page.getByTestId('message-form-submit');
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
}

/**
 * Cancel the form in a modal
 */
export async function cancelModalForm(page: Page): Promise<void> {
  const cancelButton = page.getByTestId('message-form-cancel');
  await expect(cancelButton).toBeVisible();
  await expect(cancelButton).toBeEnabled();
  await cancelButton.click();
}

/**
 * Wait for modal to close
 */
export async function waitForModalToClose(page: Page): Promise<void> {
  const modal = page.getByTestId('message-modal');
  await expect(modal).not.toBeVisible({ timeout: 15000 });
}

/**
 * Create a message via UI (complete flow)
 */
export async function createMessage(page: Page, code: string, content: string): Promise<void> {
  await openCreateModal(page);
  await fillMessageForm(page, { code, content });
  await saveModalForm(page);
  await waitForModalToClose(page);

  // Wait for the list to update and network to be idle
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

/**
 * Edit a message by finding its row
 */
export async function editMessage(
  page: Page,
  originalCode: string,
  newContent: string
): Promise<void> {
  // Search for the message to ensure it's visible
  const searchInput = page.getByTestId('search-input');
  await searchInput.fill(originalCode);
  await page.waitForTimeout(600); // Wait for debounce

  // Find the row using data-testid with code text matching
  const row = page.locator(`[data-testid^="message-row-"]:has-text("${originalCode}")`).first();
  await expect(row).toBeVisible({ timeout: 5000 });

  // Extract the message ID from the row's data-testid attribute
  const rowTestId = await row.getAttribute('data-testid');
  const messageId = rowTestId?.replace('message-row-', '') || '';

  // Click the edit button for this specific message (use first() to handle desktop/mobile views)
  await page.getByTestId(`edit-message-button-${messageId}`).first().click();

  await waitForModal(page);
  await fillFormField(page, 'content', newContent);
  await saveModalForm(page);
  await waitForModalToClose(page);

  // Wait for update and network to be idle
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

/**
 * Delete a message by finding its row
 */
export async function deleteMessage(page: Page, code: string): Promise<void> {
  // Search for the message to ensure it's visible
  const searchInput = page.getByTestId('search-input');
  await searchInput.fill(code);
  await page.waitForTimeout(600); // Wait for debounce

  // Find the row using data-testid with code text matching
  const row = page.locator(`[data-testid^="message-row-"]:has-text("${code}")`).first();
  await expect(row).toBeVisible({ timeout: 5000 });

  // Extract the message ID from the row's data-testid attribute
  const rowTestId = await row.getAttribute('data-testid');
  const messageId = rowTestId?.replace('message-row-', '') || '';

  // Click the delete button for this specific message (use first() to handle desktop/mobile views)
  await page.getByTestId(`delete-message-button-${messageId}`).first().click();

  // Wait for confirmation dialog
  const confirmDialog = page.getByTestId('delete-confirm-dialog');
  await expect(confirmDialog).toBeVisible({ timeout: 5000 });

  // Confirm deletion
  await page.getByTestId('delete-confirm-button').click();

  // Wait for dialog to close
  await expect(confirmDialog).not.toBeVisible({ timeout: 15000 });

  // Wait for list update and network to be idle
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

/**
 * Wait for the frontend to be ready
 * This assumes the user is already logged in
 */
export async function waitForFrontend(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  // Wait for the page title to load
  await expect(page).toHaveTitle(/Message Management/i, { timeout: 10000 });

  // Wait for the search input to be visible, which confirms messages have loaded
  // (SearchBar is only rendered after React Query finishes loading)
  const searchInput = page.getByTestId('search-input');
  await expect(searchInput).toBeVisible({ timeout: 15000 });
}

/**
 * Setup authenticated session for E2E tests
 * Call this in beforeEach for tests that require authentication
 */
export async function setupAuthenticatedSession(page: Page): Promise<void> {
  await login(page);
  await waitForFrontend(page);
}
