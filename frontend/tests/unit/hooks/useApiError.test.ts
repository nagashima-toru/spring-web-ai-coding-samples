import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApiError } from '@/core/hooks/useApiError';
import * as errorHandling from '@/core/lib/errorHandling';
import { createLocaleWrapper } from '../helpers/localeTestHelper';

// Mock getApiErrorMessage
vi.mock('@/core/lib/errorHandling', () => ({
  getApiErrorMessage: vi.fn(),
}));

describe('useApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態でerrorはnullである', () => {
    const { result } = renderHook(() => useApiError(), { wrapper: createLocaleWrapper() });

    expect(result.current.error).toBeNull();
  });

  it('setErrorでエラーメッセージが設定される', () => {
    const mockError = new Error('Test error');
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValue('メッセージの作成に失敗しました');

    const { result } = renderHook(() => useApiError(), { wrapper: createLocaleWrapper() });

    act(() => {
      result.current.setError(mockError);
    });

    expect(result.current.error).toBe('メッセージの作成に失敗しました');
    expect(errorHandling.getApiErrorMessage).toHaveBeenCalledWith(mockError, expect.any(Function));
  });

  it('clearErrorでエラーがクリアされる', () => {
    const mockError = new Error('Test error');
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValue('エラーが発生しました');

    const { result } = renderHook(() => useApiError(), { wrapper: createLocaleWrapper() });

    act(() => {
      result.current.setError(mockError);
    });

    expect(result.current.error).toBe('エラーが発生しました');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('handleErrorでエラーメッセージが設定され、メッセージが返される', () => {
    const mockError = new Error('Test error');
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValue('メッセージコードが既に存在します');

    const { result } = renderHook(() => useApiError(), { wrapper: createLocaleWrapper() });

    let returnedMessage: string;
    act(() => {
      returnedMessage = result.current.handleError(mockError);
    });

    expect(result.current.error).toBe('メッセージコードが既に存在します');
    expect(returnedMessage!).toBe('メッセージコードが既に存在します');
    expect(errorHandling.getApiErrorMessage).toHaveBeenCalledWith(mockError, expect.any(Function));
  });

  it('handleErrorでnullが返された場合、デフォルトメッセージが使用される', () => {
    const mockError = new Error('Unknown error');
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValue(null);

    const { result } = renderHook(() => useApiError(), { wrapper: createLocaleWrapper() });

    let returnedMessage: string;
    act(() => {
      returnedMessage = result.current.handleError(mockError);
    });

    expect(result.current.error).toBe('An unexpected error occurred');
    expect(returnedMessage!).toBe('An unexpected error occurred');
  });

  it('複数回setErrorを呼ぶと最後のエラーが保持される', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');

    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValueOnce('エラー1');
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValueOnce('エラー2');

    const { result } = renderHook(() => useApiError(), { wrapper: createLocaleWrapper() });

    act(() => {
      result.current.setError(error1);
    });

    expect(result.current.error).toBe('エラー1');

    act(() => {
      result.current.setError(error2);
    });

    expect(result.current.error).toBe('エラー2');
  });

  it('setError、clearError、handleErrorが安定した参照を返す', () => {
    const { result, rerender } = renderHook(() => useApiError(), {
      wrapper: createLocaleWrapper(),
    });

    const initialSetError = result.current.setError;
    const initialClearError = result.current.clearError;
    const initialHandleError = result.current.handleError;

    rerender();

    expect(result.current.setError).toBe(initialSetError);
    expect(result.current.clearError).toBe(initialClearError);
    expect(result.current.handleError).toBe(initialHandleError);
  });

  it('異なる種類のエラーオブジェクトを処理できる', () => {
    // Error object
    const errorObj = new Error('Error object');
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValueOnce('Error object message');

    const { result } = renderHook(() => useApiError(), { wrapper: createLocaleWrapper() });

    act(() => {
      result.current.setError(errorObj);
    });

    expect(result.current.error).toBe('Error object message');

    // String
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValueOnce('String error message');

    act(() => {
      result.current.setError('string error');
    });

    expect(result.current.error).toBe('String error message');

    // Object with response
    vi.mocked(errorHandling.getApiErrorMessage).mockReturnValueOnce('API error message');

    act(() => {
      result.current.setError({ response: { status: 404 } });
    });

    expect(result.current.error).toBe('API error message');
  });
});
