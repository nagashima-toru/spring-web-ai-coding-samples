'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import jaMessages from '../../../messages/ja.json';
import enMessages from '../../../messages/en.json';

export type Locale = 'ja' | 'en';

const messagesByLocale: Record<Locale, Record<string, unknown>> = {
  ja: jaMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Record<string, unknown>;
}

export const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);

  if (context === undefined) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
}

export interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  // Always initialize with 'ja' to match server rendering (prevents hydration mismatch)
  const [locale, setLocaleState] = useState<Locale>('ja');

  // After mount, sync with localStorage (two-pass rendering pattern to prevent SSR hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale');
      if (saved === 'ja' || saved === 'en') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(saved);
      }
    } catch {
      // localStorage unavailable - continue with default 'ja'
    }
  }, []);

  // Update document lang attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem('locale', newLocale);
    } catch {
      // localStorage unavailable (e.g., private browsing) - continue without persistence
    }
    setLocaleState(newLocale);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      messages: messagesByLocale[locale],
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
