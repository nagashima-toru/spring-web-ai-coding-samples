'use client';

import { useMemo } from 'react';
import { useAuthContext } from './useAuthContext';
import { ROLES } from '@/core/auth/roles';

/**
 * Permission flags based on user role
 */
export interface Permissions {
  /**
   * Whether the user can create resources
   */
  canCreate: boolean;

  /**
   * Whether the user can edit resources
   */
  canEdit: boolean;

  /**
   * Whether the user can delete resources
   */
  canDelete: boolean;

  /**
   * Whether the user is in read-only mode
   */
  isReadOnly: boolean;
}

/**
 * Hook to check user permissions based on role
 *
 * @returns Permission flags
 *
 * @example
 * ```tsx
 * function MessageActions() {
 *   const { canEdit, canDelete, isReadOnly } = usePermission();
 *
 *   return (
 *     <div>
 *       {canEdit && <button>Edit</button>}
 *       {canDelete && <button>Delete</button>}
 *       {isReadOnly && <div>Read-only mode</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermission(): Permissions {
  const { user } = useAuthContext();

  return useMemo(() => {
    if (!user) {
      // Not authenticated - no permissions
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        isReadOnly: true,
      };
    }

    const isAdmin = user.role === ROLES.ADMIN;

    return {
      canCreate: isAdmin,
      canEdit: isAdmin,
      canDelete: isAdmin,
      isReadOnly: !isAdmin,
    };
  }, [user]);
}
