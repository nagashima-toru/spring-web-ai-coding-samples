import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/core/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('初期値を返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('デフォルトの遅延時間(300ms)でデバウンスする', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    // 値を変更
    act(() => {
      rerender({ value: 'updated' });
    });

    // まだデバウンス期間中なので値は変わらない
    expect(result.current).toBe('initial');

    // 300ms 経過
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('指定した遅延時間でデバウンスする', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    act(() => {
      rerender({ value: 'updated' });
    });

    // 500ms 未満なので値は変わらない
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    // 500ms 経過
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('値が連続して変更された場合、最後の値のみを反映する', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    // 連続して値を変更
    act(() => {
      rerender({ value: 'first' });
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      rerender({ value: 'second' });
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      rerender({ value: 'third' });
    });

    // まだ300ms経っていないので初期値のまま
    expect(result.current).toBe('initial');

    // 最後の変更から300ms経過
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('third');
  });

  it('異なる型でデバウンスできる', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 0 },
    });

    expect(result.current).toBe(0);

    act(() => {
      rerender({ value: 42 });
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });

  it('オブジェクトをデバウンスできる', async () => {
    const initialObject = { name: 'John', age: 30 };
    const updatedObject = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: initialObject },
    });

    expect(result.current).toEqual(initialObject);

    act(() => {
      rerender({ value: updatedObject });
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual(updatedObject);
  });

  it('配列をデバウンスできる', async () => {
    const initialArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: initialArray },
    });

    expect(result.current).toEqual(initialArray);

    act(() => {
      rerender({ value: updatedArray });
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual(updatedArray);
  });

  it('遅延時間を0にした場合、即座に値を反映する', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
      initialProps: { value: 'initial' },
    });

    act(() => {
      rerender({ value: 'updated' });
    });

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('アンマウント時にタイマーをクリーンアップする', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    act(() => {
      rerender({ value: 'updated' });
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('遅延時間が変更された場合、新しい遅延時間を使用する', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 300 },
    });

    // 値と遅延時間を同時に変更
    await act(async () => {
      rerender({ value: 'updated', delay: 500 });
    });

    // 300ms では反映されない
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // 500ms で反映される (追加で200ms)
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });
});
