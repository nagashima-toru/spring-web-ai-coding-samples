'use client';

import { createContext, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserResponse } from '@/core/api/generated/models';
import type { UnauthorizedResponse } from '@/core/api/generated/models';
import { useGetCurrentUser } from '@/core/api/generated/auth/auth';

/**
 * Authentication context value
 */
export interface AuthContextValue {
  /**
   * Current authenticated user
   */
  user: UserResponse | null;

  /**
   * Whether user information is being loaded
   */
  isLoading: boolean;

  /**
   * Error that occurred during user information fetch
   */
  error: UnauthorizedResponse | null;

  /**
   * Refetch user information
   */
  refetch: () => void;
}

/**
 * Authentication context
 *
 * Provides user information across the application
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider props
 */
export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 *
 * Provides authentication state to child components using /api/users/me endpoint.
 *
 * Error handling:
 * - 401 Unauthorized: Redirect to login page
 * - Other errors: Default to read-only mode (user = null)
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't fetch user data on login page to avoid infinite redirect loop
  const isLoginPage = pathname === '/login';
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetCurrentUser<UserResponse, UnauthorizedResponse>({
    query: {
      // Cache for 5 minutes (staleTime)
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes (gcTime, formerly cacheTime)
      gcTime: 10 * 60 * 1000,
      // Retry on failure
      retry: 1,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Don't fetch on login page to prevent infinite redirect loop
      enabled: !isLoginPage,
    },
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      // Redirect to login on 401 Unauthorized, but only if not already on login page
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
    // For other errors, we default to read-only mode (user = null)
    // which is handled by usePermission Hook
  }, [error, router, pathname]);

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    error: error ?? null,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
