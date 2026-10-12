import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';

// Mock API responses
const mockUserResponse = {
  username: 'testuser',
  role: 'ADMIN',
};

const mockUnauthorizedResponse = {
  type: 'about:blank',
  title: 'Unauthorized',
  status: 401,
  detail: 'Full authentication is required to access this resource',
  instance: '/api/users/me',
  timestamp: new Date().toISOString(),
};

// Setup MSW server
const server = setupServer(
  http.get('http://localhost:8080/api/users/me', () => {
    return HttpResponse.json(mockUserResponse);
  })
);

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  server.close();
});

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retry for tests
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return Wrapper;
}

describe('useCurrentUser', () => {
  it('成功時にユーザー情報を取得できる', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUserResponse);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('401エラー時にエラーを返す', async () => {
    server.use(
      http.get('http://localhost:8080/api/users/me', () => {
        return new HttpResponse(JSON.stringify(mockUnauthorizedResponse), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      })
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    // Wait for error
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('キャッシュが有効になっている', async () => {
    const wrapper = createWrapper();

    // First render
    const { result: result1 } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Mock API call to track if it's called again
    let apiCallCount = 0;
    server.use(
      http.get('http://localhost:8080/api/users/me', () => {
        apiCallCount++;
        return HttpResponse.json(mockUserResponse);
      })
    );

    // Second render with same wrapper (should use cache)
    const { result: result2 } = renderHook(() => useCurrentUser(), { wrapper });

    // Should immediately have data from cache
    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // API should not be called again due to cache
    expect(apiCallCount).toBe(0);
    expect(result2.current.data).toEqual(mockUserResponse);
  });

  it('refetch関数が提供される', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(typeof result.current.refetch).toBe('function');
  });
});
