import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LocaleProvider, LocaleContext, useLocale } from '@/core/i18n/LocaleContext';
import type { LocaleContextValue } from '@/core/i18n/LocaleContext';

describe('useLocale', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('LocaleProvider外で使用した場合、エラーをスローする', () => {
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useLocale());
    }).toThrow('useLocale must be used within LocaleProvider');

    console.error = originalError;
  });

  it('デフォルト locale が ja である（localStorage 未設定時）', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('ja');
  });

  it('localStorage に en がある場合、初期 locale が en になる', () => {
    localStorage.setItem('locale', 'en');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('en');
  });

  it('localStorage に ja がある場合、初期 locale が ja になる', () => {
    localStorage.setItem('locale', 'ja');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('ja');
  });

  it('localStorage に無効な値がある場合、デフォルト ja になる', () => {
    localStorage.setItem('locale', 'fr');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('ja');
  });

  it('setLocale で locale が en に変更される', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale('en');
    });

    expect(result.current.locale).toBe('en');
  });

  it('setLocale で locale が ja に変更される', () => {
    localStorage.setItem('locale', 'en');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale('ja');
    });

    expect(result.current.locale).toBe('ja');
  });

  it('setLocale 呼び出し時に localStorage.setItem が呼ばれる', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale('en');
    });

    expect(setItemSpy).toHaveBeenCalledWith('locale', 'en');
  });

  it('localStorage が使用不可の場合（例外発生）、フォールバックとして ja が使われる', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('ja');
  });

  it('localStorage への書き込みが失敗しても locale の状態変更は成功する', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    // Should not throw even if localStorage.setItem fails
    act(() => {
      result.current.setLocale('en');
    });

    expect(result.current.locale).toBe('en');
  });

  it('messages が locale に対応する翻訳データを含む', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    // Japanese messages should be provided by default
    expect(result.current.messages).toBeDefined();
    expect(typeof result.current.messages).toBe('object');
  });

  it('locale 変更時に messages が切り替わる', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    const jaMessages = result.current.messages;

    act(() => {
      result.current.setLocale('en');
    });

    const enMessages = result.current.messages;

    expect(jaMessages).not.toBe(enMessages);
  });
});

describe('LocaleContext direct usage', () => {
  it('LocaleContext.Provider で直接値を注入できる', () => {
    const mockValue: LocaleContextValue = {
      locale: 'en',
      setLocale: vi.fn(),
      messages: { test: 'test' },
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleContext.Provider value={mockValue}>{children}</LocaleContext.Provider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('en');
    expect(result.current.messages).toEqual({ test: 'test' });
  });
});
