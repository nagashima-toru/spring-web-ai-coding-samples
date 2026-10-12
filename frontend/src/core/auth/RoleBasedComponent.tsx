'use client';

import type { ReactNode } from 'react';
import { useAuthContext } from '@/core/auth/useAuthContext';

/**
 * Props for RoleBasedComponent
 */
export interface RoleBasedComponentProps {
  /**
   * Allowed roles that can see the children
   */
  allowedRoles: string[];

  /**
   * Content to render when role is allowed
   */
  children: ReactNode;

  /**
   * Optional fallback content to render when role is not allowed
   */
  fallback?: ReactNode;
}

/**
 * Component that renders children based on user role
 *
 * @example
 * ```tsx
 * <RoleBasedComponent allowedRoles={['ADMIN']}>
 *   <button>Edit</button>
 * </RoleBasedComponent>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <RoleBasedComponent
 *   allowedRoles={['ADMIN']}
 *   fallback={<div>Read-only mode</div>}
 * >
 *   <button>Edit</button>
 * </RoleBasedComponent>
 * ```
 */
export function RoleBasedComponent({
  allowedRoles,
  children,
  fallback = null,
}: RoleBasedComponentProps) {
  const { user } = useAuthContext();

  // If no user or user role not in allowed roles, render fallback or hide
  const isAllowed = user && allowedRoles.includes(user.role);

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
