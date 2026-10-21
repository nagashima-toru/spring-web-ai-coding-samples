'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLogin, useLogout, useRefreshToken } from '@/core/api/generated/auth/auth';
import type { LoginRequest, LoginResponse } from '@/core/api/generated/models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_TYPE_KEY = 'token_type';
const EXPIRES_IN_KEY = 'expires_in';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getAccessToken: () => string | null;
}

// localStorage のトークンを外部ストアとして購読する（effect 内で setState せずに初期状態を読むため）
const tokenListeners = new Set<() => void>();

const subscribeTokens = (listener: () => void) => {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
};

const notifyTokenChange = () => {
  tokenListeners.forEach((listener) => listener());
};

const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const getServerToken = () => null;

// ハイドレーション完了前は true を返し、サーバー描画と初回描画を一致させる
const subscribeNever = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

export const useAuth = (): UseAuthReturn => {
  const storedAccessToken = useSyncExternalStore(
    subscribeTokens,
    getStoredAccessToken,
    getServerToken
  );
  const storedRefreshToken = useSyncExternalStore(
    subscribeTokens,
    getStoredRefreshToken,
    getServerToken
  );
  const hydrated = useSyncExternalStore(subscribeNever, getHydrated, getServerHydrated);

  const authState: AuthState = {
    isAuthenticated: !!storedAccessToken,
    isLoading: !hydrated,
    accessToken: storedAccessToken,
    refreshToken: storedRefreshToken,
  };

  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshToken();

  const saveTokens = useCallback((response: LoginResponse) => {
    const { accessToken, refreshToken, tokenType, expiresIn } = response;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
    localStorage.setItem(EXPIRES_IN_KEY, expiresIn.toString());

    notifyTokenChange();
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);

    notifyTokenChange();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const loginRequest: LoginRequest = { username, password };

      try {
        const response = await loginMutation.mutateAsync({ data: loginRequest });
        saveTokens(response);
      } catch (error) {
        clearTokens();
        throw error;
      }
    },
    [loginMutation, saveTokens, clearTokens]
  );

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    try {
      if (storedRefreshToken) {
        await logoutMutation.mutateAsync({ data: { refreshToken: storedRefreshToken } });
      }
    } catch (error) {
      // Suppress error - local cleanup should always succeed
      console.warn('Logout API call failed, but clearing local tokens', error);
    } finally {
      clearTokens();
      // Clear React Query cache to prevent stale data after logout
      queryClient.clear();
    }
  }, [logoutMutation, clearTokens, queryClient]);

  const refreshAuth = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      clearTokens();
      return;
    }

    try {
      const response = await refreshMutation.mutateAsync({
        data: { refreshToken: storedRefreshToken },
      });
      saveTokens(response);
    } catch (error) {
      clearTokens();
      throw error;
    }
  }, [refreshMutation, saveTokens, clearTokens]);

  const getAccessToken = useCallback(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshAuth,
    getAccessToken,
  };
};
