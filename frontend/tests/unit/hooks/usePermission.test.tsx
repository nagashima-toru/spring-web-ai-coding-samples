import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermission } from '@/core/auth/usePermission';
import { AuthProvider, AuthContext } from '@/core/auth/AuthContext';
import { ROLES } from '@/core/auth/roles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserResponse } from '@/core/api/generated/models';
import type { ReactNode } from 'react';

// Mock useRouter and usePathname
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock useGetCurrentUser from generated API
vi.mock('@/core/api/generated/auth/auth', () => ({
  useGetCurrentUser: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

describe('usePermission', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('認証されていない場合、全権限がfalseでisReadOnlyがtrueになる', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => usePermission(), { wrapper });

    expect(result.current.canCreate).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.isReadOnly).toBe(true);
  });

  it('ADMINロールの場合、全権限がtrueになる（カスタムプロバイダー使用）', () => {
    const adminUser: UserResponse = { username: 'admin', role: ROLES.ADMIN };

    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider
        value={{
          user: adminUser,
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => usePermission(), { wrapper: TestWrapper });

    expect(result.current.canCreate).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.isReadOnly).toBe(false);
  });

  it('VIEWERロールの場合、全権限がfalseでisReadOnlyがtrueになる', () => {
    const viewerUser: UserResponse = { username: 'viewer', role: ROLES.VIEWER };

    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider
        value={{
          user: viewerUser,
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => usePermission(), { wrapper: TestWrapper });

    expect(result.current.canCreate).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.isReadOnly).toBe(true);
  });
});
