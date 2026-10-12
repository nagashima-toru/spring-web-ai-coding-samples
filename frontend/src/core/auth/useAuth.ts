'use client';

import { useState, useEffect, useCallback } from 'react';
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

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    refreshToken: null,
  });

  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshToken();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    setAuthState({
      isAuthenticated: !!accessToken,
      isLoading: false,
      accessToken,
      refreshToken,
    });
  }, []);

  const saveTokens = useCallback((response: LoginResponse) => {
    const { accessToken, refreshToken, tokenType, expiresIn } = response;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
    localStorage.setItem(EXPIRES_IN_KEY, expiresIn.toString());

    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      accessToken,
      refreshToken,
    });
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
    });
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
