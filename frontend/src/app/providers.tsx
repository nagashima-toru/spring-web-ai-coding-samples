'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider } from 'next-intl';
import { makeQueryClient } from '@/core/api/query-client';
import { AuthProvider } from '@/core/auth/AuthContext';
import { LocaleProvider, useLocale } from '@/core/i18n/LocaleContext';

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Inner provider that reads locale from LocaleContext and provides NextIntlClientProvider.
 * Must be a child of LocaleProvider.
 */
function IntlProviderWrapper({ children }: { children: React.ReactNode }) {
  const { locale, messages } = useLocale();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <LocaleProvider>
      <IntlProviderWrapper>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            {/* React Query Devtools - only in development */}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </AuthProvider>
        </QueryClientProvider>
      </IntlProviderWrapper>
    </LocaleProvider>
  );
}
