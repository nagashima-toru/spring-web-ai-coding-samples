import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/tests/e2e/**',
      '**/*.stories.{ts,tsx,js,jsx}', // Exclude Storybook stories from default test runs
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        // Dependencies and generated files
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/generated/**',
        // Orval auto-generated API client
        '**/*.d.ts',
        '.next/**',
        // Next.js build output
        'playwright/**',
        // E2E test setup files
        '.lintstagedrc.js',
        // Lint-staged configuration

        // Next.js entry points (covered by E2E tests)
        'src/app/layout.tsx',
        // Root layout - framework setup
        'src/app/page.tsx',
        // Main page - integration tested in E2E
        'src/app/providers.tsx',
        // React Query provider wrapper

        // Infrastructure configuration (environment-dependent, minimal logic)
        'src/core/api/client.ts',
        // Axios instance configuration
        'src/core/api/query-client.ts',
        // React Query client setup

        // Unused UI components (not currently utilized in the application)
        'src/core/components/ui/badge.tsx',
        'src/core/components/ui/card.tsx',
        'src/core/components/PageHeader.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
