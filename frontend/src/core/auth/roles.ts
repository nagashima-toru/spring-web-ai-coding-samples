/**
 * User role definitions
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Check if a role is ADMIN
 */
export function isAdmin(role?: Role | null): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if a role is VIEWER
 */
export function isViewer(role?: Role | null): boolean {
  return role === ROLES.VIEWER;
}
