import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RoleBasedComponent } from './RoleBasedComponent';
import { AuthContext } from '@/core/auth/AuthContext';
import { ROLES } from '@/core/auth/roles';
import type { UserResponse } from '@/core/api/generated/models';

const meta = {
  title: 'Common/RoleBasedComponent',
  component: RoleBasedComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    allowedRoles: {
      description: 'Array of roles that can see the children',
      control: 'object',
    },
    children: {
      description: 'Content to show when user has allowed role',
      control: false,
    },
    fallback: {
      description: 'Content to show when user does not have allowed role',
      control: false,
    },
  },
} satisfies Meta<typeof RoleBasedComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ADMIN user can see protected content
 */
export const AdminCanSee: Story = {
  args: {
    allowedRoles: [ROLES.ADMIN],
    children: (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="font-semibold text-green-900">Admin-Only Content</h3>
        <p className="text-sm text-green-700">This content is visible to ADMIN users.</p>
      </div>
    ),
  },
  decorators: [
    (Story) => {
      const adminUser: UserResponse = { username: 'admin', role: ROLES.ADMIN };
      return (
        <AuthContext.Provider
          value={{
            user: adminUser,
            isLoading: false,
            error: null,
            refetch: () => {},
          }}
        >
          <Story />
        </AuthContext.Provider>
      );
    },
  ],
};

/**
 * VIEWER user cannot see protected content (nothing shown)
 */
export const ViewerCannotSee: Story = {
  args: {
    allowedRoles: [ROLES.ADMIN],
    children: (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="font-semibold text-green-900">Admin-Only Content</h3>
        <p className="text-sm text-green-700">This content is visible to ADMIN users.</p>
      </div>
    ),
  },
  decorators: [
    (Story) => {
      const viewerUser: UserResponse = { username: 'viewer', role: ROLES.VIEWER };
      return (
        <AuthContext.Provider
          value={{
            user: viewerUser,
            isLoading: false,
            error: null,
            refetch: () => {},
          }}
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Protected content is hidden. You should see nothing below:
            </p>
            <div className="mt-2 min-h-[80px] rounded border-2 border-dashed border-gray-300 p-2">
              <Story />
            </div>
          </div>
        </AuthContext.Provider>
      );
    },
  ],
};

/**
 * VIEWER user sees fallback content instead of protected content
 */
export const WithFallback: Story = {
  args: {
    allowedRoles: [ROLES.ADMIN],
    children: (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="font-semibold text-green-900">Admin-Only Content</h3>
        <p className="text-sm text-green-700">This content is visible to ADMIN users.</p>
      </div>
    ),
    fallback: (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="font-semibold text-yellow-900">Read-Only Mode</h3>
        <p className="text-sm text-yellow-700">
          You do not have permission to access this feature.
        </p>
      </div>
    ),
  },
  decorators: [
    (Story) => {
      const viewerUser: UserResponse = { username: 'viewer', role: ROLES.VIEWER };
      return (
        <AuthContext.Provider
          value={{
            user: viewerUser,
            isLoading: false,
            error: null,
            refetch: () => {},
          }}
        >
          <Story />
        </AuthContext.Provider>
      );
    },
  ],
};

/**
 * Multiple roles can be allowed
 */
export const MultipleAllowedRoles: Story = {
  args: {
    allowedRoles: [ROLES.ADMIN, ROLES.VIEWER],
    children: (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">Shared Content</h3>
        <p className="text-sm text-blue-700">
          This content is visible to both ADMIN and VIEWER users.
        </p>
      </div>
    ),
  },
  decorators: [
    (Story) => {
      const viewerUser: UserResponse = { username: 'viewer', role: ROLES.VIEWER };
      return (
        <AuthContext.Provider
          value={{
            user: viewerUser,
            isLoading: false,
            error: null,
            refetch: () => {},
          }}
        >
          <Story />
        </AuthContext.Provider>
      );
    },
  ],
};

/**
 * Unauthenticated user sees nothing
 */
export const Unauthenticated: Story = {
  args: {
    allowedRoles: [ROLES.ADMIN],
    children: (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="font-semibold text-green-900">Protected Content</h3>
        <p className="text-sm text-green-700">This content requires authentication.</p>
      </div>
    ),
  },
  decorators: [
    (Story) => {
      return (
        <AuthContext.Provider
          value={{
            user: null,
            isLoading: false,
            error: null,
            refetch: () => {},
          }}
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              User not authenticated. Protected content is hidden below:
            </p>
            <div className="mt-2 min-h-[80px] rounded border-2 border-dashed border-gray-300 p-2">
              <Story />
            </div>
          </div>
        </AuthContext.Provider>
      );
    },
  ],
};
