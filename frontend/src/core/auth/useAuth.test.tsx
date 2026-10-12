import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import * as authApi from '@/core/api/generated/auth/auth';
import type { LoginResponse } from '@/core/api/generated/models';
import type { ReactNode } from 'react';

// Mock the auth API module
vi.mock('@/core/api/generated/auth/auth', () => ({
  useLogin: vi.fn(),
  useLogout: vi.fn(),
  useRefreshToken: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return QueryClientProvider({ client: queryClient, children });
  };

  return Wrapper;
};

describe('useAuth', () => {
  let mockLoginMutateAsync: ReturnType<typeof vi.fn>;
  let mockLogoutMutateAsync: ReturnType<typeof vi.fn>;
  let mockRefreshMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Setup mock mutation functions
    mockLoginMutateAsync = vi.fn();
    mockLogoutMutateAsync = vi.fn();
    mockRefreshMutateAsync = vi.fn();

    // Setup mock hooks
    vi.mocked(authApi.useLogin).mockReturnValue({
      mutateAsync: mockLoginMutateAsync,
    } as never);

    vi.mocked(authApi.useLogout).mockReturnValue({
      mutateAsync: mockLogoutMutateAsync,
    } as never);

    vi.mocked(authApi.useRefreshToken).mockReturnValue({
      mutateAsync: mockRefreshMutateAsync,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('未認証状態で初期化される', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
    });

    it('localStorageにトークンがある場合、認証状態で初期化される', async () => {
      localStorage.setItem('access_token', 'test-access-token');
      localStorage.setItem('refresh_token', 'test-refresh-token');

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('test-access-token');
      expect(result.current.refreshToken).toBe('test-refresh-token');
    });
  });

  describe('login', () => {
    it('ログインに成功すると、トークンがlocalStorageに保存される', async () => {
      const mockResponse: LoginResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockLoginMutateAsync.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('new-access-token');
      expect(result.current.refreshToken).toBe('new-refresh-token');
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
      expect(localStorage.getItem('token_type')).toBe('Bearer');
      expect(localStorage.getItem('expires_in')).toBe('3600');
    });

    it('ログインに失敗すると、エラーがthrowされる', async () => {
      const mockError = new Error('Invalid credentials');
      mockLoginMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('admin', 'wrong-password');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('ログアウトすると、リフレッシュトークンがサーバーに送信され、トークンがlocalStorageから削除される', async () => {
      localStorage.setItem('access_token', 'test-access-token');
      localStorage.setItem('refresh_token', 'test-refresh-token');

      mockLogoutMutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockLogoutMutateAsync).toHaveBeenCalledWith({
        data: { refreshToken: 'test-refresh-token' },
      });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('ログアウトAPIが失敗しても、ローカル状態はクリアされる', async () => {
      localStorage.setItem('access_token', 'test-access-token');
      localStorage.setItem('refresh_token', 'test-refresh-token');

      mockLogoutMutateAsync.mockRejectedValue(new Error('API error'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('リフレッシュトークンがない場合でも、ローカル状態はクリアされる', async () => {
      localStorage.setItem('access_token', 'test-access-token');

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockLogoutMutateAsync).not.toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('refreshAuth', () => {
    it('トークンをリフレッシュすると、新しいトークンが保存される', async () => {
      localStorage.setItem('refresh_token', 'old-refresh-token');

      const mockResponse: LoginResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockRefreshMutateAsync.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('new-access-token');
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
    });

    it('リフレッシュトークンがない場合、状態がクリアされる', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRefreshMutateAsync).not.toHaveBeenCalled();
    });

    it('リフレッシュに失敗すると、トークンがクリアされる', async () => {
      localStorage.setItem('refresh_token', 'invalid-token');

      mockRefreshMutateAsync.mockRejectedValue(new Error('Token expired'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await expect(
        act(async () => {
          await result.current.refreshAuth();
        })
      ).rejects.toThrow('Token expired');

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('getAccessToken', () => {
    it('localStorageからアクセストークンを取得できる', async () => {
      localStorage.setItem('access_token', 'test-access-token');

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getAccessToken()).toBe('test-access-token');
    });

    it('トークンがない場合、nullを返す', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getAccessToken()).toBeNull();
    });
  });
});
