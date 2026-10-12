'use client';

import { useGetCurrentUser } from '@/core/api/generated/auth/auth';
import type { UserResponse } from '@/core/api/generated/models';
import type { UnauthorizedResponse } from '@/core/api/generated/models';

/**
 * Hook to fetch current user information
 *
 * Uses React Query to fetch user data from /api/users/me with caching.
 *
 * @returns Query result with user data
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data: user, isLoading, error } = useCurrentUser();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error loading user</div>;
 *
 *   return <div>Hello, {user?.username}!</div>;
 * }
 * ```
 */
export function useCurrentUser() {
  return useGetCurrentUser<UserResponse, UnauthorizedResponse>({
    query: {
      // Cache for 5 minutes (staleTime)
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes (gcTime, formerly cacheTime)
      gcTime: 10 * 60 * 1000,
      // Retry on failure
      retry: 1,
      // Refetch on window focus
      refetchOnWindowFocus: true,
    },
  });
}
