import type { Preview } from '@storybook/nextjs-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { NextIntlClientProvider } from 'next-intl';
import jaMessages from '../messages/ja.json';
import { handlers } from '../src/core/api/mocks/handlers';

// Import Tailwind CSS
import '../src/app/globals.css';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});

// Create a React Query client for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    msw: {
      handlers,
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => (
      <QueryClientProvider client={queryClient}>
        {/* Default translations for components using useTranslations; stories may wrap their own provider */}
        <NextIntlClientProvider locale="ja" messages={jaMessages}>
          <Story />
        </NextIntlClientProvider>
      </QueryClientProvider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview;
