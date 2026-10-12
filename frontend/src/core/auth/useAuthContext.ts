'use client';

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/core/auth/AuthContext';

/**
 * Hook to access authentication context
 *
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading } = useAuthContext();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!user) return <div>Not authenticated</div>;
 *
 *   return <div>Hello, {user.username}!</div>;
 * }
 * ```
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
