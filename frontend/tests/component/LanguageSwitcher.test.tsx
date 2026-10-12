import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LanguageSwitcher } from '@/core/i18n/LanguageSwitcher';
import { LocaleContext } from '@/core/i18n/LocaleContext';
import jaMessages from '../../messages/ja.json';
import enMessages from '../../messages/en.json';
import type { ReactNode } from 'react';

function createJaWrapper() {
  function JaWrapper({ children }: { children: ReactNode }) {
    return (
      <LocaleContext.Provider
        value={{
          locale: 'ja',
          setLocale: vi.fn(),
          messages: jaMessages as Record<string, unknown>,
        }}
      >
        {children}
      </LocaleContext.Provider>
    );
  }
  return JaWrapper;
}

function createEnWrapper(setLocale = vi.fn()) {
  function EnWrapper({ children }: { children: ReactNode }) {
    return (
      <LocaleContext.Provider
        value={{
          locale: 'en',
          setLocale,
          messages: enMessages as Record<string, unknown>,
        }}
      >
        {children}
      </LocaleContext.Provider>
    );
  }
  return EnWrapper;
}

describe('LanguageSwitcher', () => {
  describe('表示', () => {
    it('日本語設定時に「🌐 日本語」が表示される', () => {
      render(<LanguageSwitcher />, { wrapper: createJaWrapper() });
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      expect(screen.getByText('🌐 日本語')).toBeInTheDocument();
    });

    it('英語設定時に「🌐 English」が表示される', () => {
      render(<LanguageSwitcher />, { wrapper: createEnWrapper() });
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      expect(screen.getByText('🌐 English')).toBeInTheDocument();
    });

    it('data-testid="language-switcher" で要素を取得できる', () => {
      render(<LanguageSwitcher />, { wrapper: createJaWrapper() });
      const button = screen.getByTestId('language-switcher');
      expect(button).toBeVisible();
    });
  });

  describe('クリック操作', () => {
    it('日本語設定時にクリックすると setLocale("en") が呼ばれる', async () => {
      const setLocale = vi.fn();
      const user = userEvent.setup();

      const Wrapper = ({ children }: { children: ReactNode }) => (
        <LocaleContext.Provider
          value={{
            locale: 'ja',
            setLocale,
            messages: jaMessages as Record<string, unknown>,
          }}
        >
          {children}
        </LocaleContext.Provider>
      );

      render(<LanguageSwitcher />, { wrapper: Wrapper });

      await user.click(screen.getByTestId('language-switcher'));

      expect(setLocale).toHaveBeenCalledOnce();
      expect(setLocale).toHaveBeenCalledWith('en');
    });

    it('英語設定時にクリックすると setLocale("ja") が呼ばれる', async () => {
      const setLocale = vi.fn();
      const user = userEvent.setup();

      render(<LanguageSwitcher />, { wrapper: createEnWrapper(setLocale) });

      await user.click(screen.getByTestId('language-switcher'));

      expect(setLocale).toHaveBeenCalledOnce();
      expect(setLocale).toHaveBeenCalledWith('ja');
    });
  });

  describe('className prop', () => {
    it('className が渡された場合にクラスが適用される', () => {
      render(<LanguageSwitcher className="custom-class" />, { wrapper: createJaWrapper() });
      const button = screen.getByTestId('language-switcher');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('サイズ', () => {
    it('デフォルトサイズで表示される（size="sm" が適用されていない）', () => {
      render(<LanguageSwitcher />, { wrapper: createJaWrapper() });
      const button = screen.getByTestId('language-switcher');
      // Default size uses h-10; sm size uses h-9
      expect(button).toHaveClass('h-10');
      expect(button).not.toHaveClass('h-9');
    });
  });
});
