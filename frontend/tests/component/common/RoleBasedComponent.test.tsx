import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RoleBasedComponent } from '@/core/auth/RoleBasedComponent';
import { AuthContext } from '@/core/auth/AuthContext';
import { ROLES } from '@/core/auth/roles';
import type { UserResponse } from '@/core/api/generated/models';
import type { ReactNode } from 'react';

// Mock useRouter and usePathname (required by AuthContext)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

describe('RoleBasedComponent', () => {
  const TestContent = () => <div>Protected Content</div>;
  const FallbackContent = () => <div>Fallback Content</div>;

  it('ADMIN ロールの場合、children が表示される', () => {
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

    render(
      <TestWrapper>
        <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
          <TestContent />
        </RoleBasedComponent>
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('VIEWER ロールの場合、children が表示されない', () => {
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

    render(
      <TestWrapper>
        <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
          <TestContent />
        </RoleBasedComponent>
      </TestWrapper>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('VIEWER ロールで fallback が指定されている場合、fallback が表示される', () => {
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

    render(
      <TestWrapper>
        <RoleBasedComponent allowedRoles={[ROLES.ADMIN]} fallback={<FallbackContent />}>
          <TestContent />
        </RoleBasedComponent>
      </TestWrapper>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  it('ユーザーが認証されていない場合、children が表示されない', () => {
    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider
        value={{
          user: null,
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    render(
      <TestWrapper>
        <RoleBasedComponent allowedRoles={[ROLES.ADMIN]}>
          <TestContent />
        </RoleBasedComponent>
      </TestWrapper>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allowedRoles に複数のロールを指定できる', () => {
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

    render(
      <TestWrapper>
        <RoleBasedComponent allowedRoles={[ROLES.ADMIN, ROLES.VIEWER]}>
          <TestContent />
        </RoleBasedComponent>
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
