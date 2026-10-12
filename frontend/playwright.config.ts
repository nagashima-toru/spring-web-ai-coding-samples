import { defineConfig, devices } from '@playwright/test';

/**
 * E2E test configuration.
 *
 * Prerequisite: the backend is running with the `local` profile on API_URL (default http://localhost:8080),
 * which seeds the admin/viewer users. Playwright starts the frontend itself (webServer).
 * See docs/development-guide.md for the full procedure.
 */
const apiUrl = process.env.API_URL ?? 'http://localhost:8080';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 20000,
    navigationTimeout: 20000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Allows using a preinstalled browser when its version differs from @playwright/test
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined },
      },
    },
  ],

  webServer: {
    command: process.env.CI ? 'pnpm build && pnpm start' : 'pnpm dev',
    url: 'http://localhost:3000',
    env: { NEXT_PUBLIC_API_URL: apiUrl },
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
