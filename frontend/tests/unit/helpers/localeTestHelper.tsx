import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { LocaleContext, type Locale } from '@/core/i18n/LocaleContext';
import jaMessages from '../../../messages/ja.json';
import enMessages from '../../../messages/en.json';

const messagesByLocale: Record<Locale, Record<string, unknown>> = {
  ja: jaMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

/**
 * Creates a test wrapper that provides LocaleContext and NextIntlClientProvider.
 * Use this when testing components that use useLocale() or useTranslations().
 *
 * @param locale - The locale to use ('ja' | 'en'). Defaults to 'ja'.
 * @returns A React component to be passed as `wrapper` to render() or renderHook().
 *
 * @example
 * render(<MyComponent />, { wrapper: createLocaleWrapper('ja') });
 * render(<MyComponent />, { wrapper: createLocaleWrapper('en') });
 */
export function createLocaleWrapper(locale: Locale = 'ja') {
  const messages = messagesByLocale[locale];

  function LocaleWrapper({ children }: { children: ReactNode }) {
    return (
      <LocaleContext.Provider value={{ locale, setLocale: () => {}, messages }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </LocaleContext.Provider>
    );
  }

  LocaleWrapper.displayName = `LocaleWrapper(${locale})`;
  return LocaleWrapper;
}
