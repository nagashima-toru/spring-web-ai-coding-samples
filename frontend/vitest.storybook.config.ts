import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Storybook-specific Vitest configuration
// Run with: pnpm test:storybook
export default defineConfig({
  plugins: [
    react(),
    storybookTest({
      configDir: path.join(dirname, '.storybook'),
    }),
  ],
  test: {
    name: 'storybook',
    environment: 'jsdom',
    globals: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
    // Disable coverage for Storybook tests
    // Storybook tests are for visual/rendering validation, not code coverage
    coverage: {
      enabled: false,
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/tests/e2e/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
