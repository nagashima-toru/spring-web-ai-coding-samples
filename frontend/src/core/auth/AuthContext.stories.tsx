import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthProvider, AuthContext } from './AuthContext';
import { useAuthContext } from '@/core/auth/useAuthContext';
import { usePermission } from '@/core/auth/usePermission';
import { ROLES } from '@/core/auth/roles';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';

/**
 * Demo component that displays auth state and permissions
 */
function AuthDemo() {
  const { user, isLoading } = useAuthContext();
  const { canCreate, canEdit, canDelete, isReadOnly } = usePermission();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Current authenticated user</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Username:</span> {user.username}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{' '}
                <Badge variant={user.role === ROLES.ADMIN ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Not authenticated</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Role-based access control</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Can Create:</span>
              <Badge variant={canCreate ? 'default' : 'outline'}>
                {canCreate ? 'Allowed' : 'Denied'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Can Edit:</span>
              <Badge variant={canEdit ? 'default' : 'outline'}>
                {canEdit ? 'Allowed' : 'Denied'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Can Delete:</span>
              <Badge variant={canDelete ? 'default' : 'outline'}>
                {canDelete ? 'Allowed' : 'Denied'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Read-only Mode:</span>
              <Badge variant={isReadOnly ? 'secondary' : 'outline'}>
                {isReadOnly ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Buttons</CardTitle>
          <CardDescription>Buttons disabled based on permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button disabled={!canCreate}>Create</Button>
            <Button disabled={!canEdit} variant="outline">
              Edit
            </Button>
            <Button disabled={!canDelete} variant="destructive">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const meta = {
  title: 'Contexts/AuthContext',
  component: AuthProvider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuthProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Not authenticated - no user, read-only mode
 */
export const NotAuthenticated: Story = {
  args: {
    children: <AuthDemo />,
  },
};

/**
 * ADMIN role - full permissions
 */
export const AdminUser: Story = {
  args: {
    children: <AuthDemo />,
  },
  render: (_args) => (
    <AuthContext.Provider
      value={{
        user: { username: 'admin', role: ROLES.ADMIN },
        isLoading: false,
        error: null,
        refetch: () => {},
      }}
    >
      <AuthDemo />
    </AuthContext.Provider>
  ),
};

/**
 * VIEWER role - read-only permissions
 */
export const ViewerUser: Story = {
  args: {
    children: <AuthDemo />,
  },
  render: (_args) => (
    <AuthContext.Provider
      value={{
        user: { username: 'viewer', role: ROLES.VIEWER },
        isLoading: false,
        error: null,
        refetch: () => {},
      }}
    >
      <AuthDemo />
    </AuthContext.Provider>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    children: <AuthDemo />,
  },
  render: (_args) => (
    <AuthContext.Provider
      value={{
        user: null,
        isLoading: true,
        error: null,
        refetch: () => {},
      }}
    >
      <AuthDemo />
    </AuthContext.Provider>
  ),
};

/**
 * Comparison of all roles
 */
export const RoleComparison: Story = {
  args: {
    children: <AuthDemo />,
  },
  render: (_args) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Not Authenticated</h3>
        <AuthProvider>
          <AuthDemo />
        </AuthProvider>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">VIEWER Role</h3>
        <AuthContext.Provider
          value={{
            user: { username: 'viewer', role: ROLES.VIEWER },
            isLoading: false,
            error: null,
            refetch: () => {},
          }}
        >
          <AuthDemo />
        </AuthContext.Provider>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">ADMIN Role</h3>
        <AuthContext.Provider
          value={{
            user: { username: 'admin', role: ROLES.ADMIN },
            isLoading: false,
            error: null,
            refetch: () => {},
          }}
        >
          <AuthDemo />
        </AuthContext.Provider>
      </div>
    </div>
  ),
};
