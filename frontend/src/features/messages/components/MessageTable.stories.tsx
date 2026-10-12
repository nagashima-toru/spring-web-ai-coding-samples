import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MessageTable } from './MessageTable';
import { MessageResponse, UserResponse } from '@/core/api/generated/models';
import { getGetAllMessagesMockHandler } from '@/core/api/generated/message/message.msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse, delay } from 'msw';
import { AuthContext } from '@/core/auth/AuthContext';
import { ROLES } from '@/core/auth/roles';

const meta = {
  title: 'Messages/MessageTable',
  component: MessageTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      // Default to ADMIN user for all stories
      const defaultUser: UserResponse = { username: 'admin', role: ROLES.ADMIN };
      return (
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider
            value={{
              user: defaultUser,
              isLoading: false,
              error: null,
              refetch: () => {},
            }}
          >
            <Story />
          </AuthContext.Provider>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof MessageTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMessages: MessageResponse[] = [
  {
    id: 1,
    code: 'WELCOME',
    content: 'Welcome to our application!',
    createdAt: '2026-01-29T00:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
  },
  {
    id: 2,
    code: 'ERROR_001',
    content: 'An error occurred while processing your request.',
    createdAt: '2026-01-29T00:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
  },
  {
    id: 3,
    code: 'SUCCESS',
    content: 'Operation completed successfully.',
    createdAt: '2026-01-29T00:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
  },
  {
    id: 4,
    code: 'WARNING',
    content: 'Please review your input before continuing.',
    createdAt: '2026-01-29T00:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
  },
  {
    id: 5,
    code: 'INFO',
    content: 'This is an informational message.',
    createdAt: '2026-01-29T00:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
  },
];

const manyMessages: MessageResponse[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  code: `MSG_${String(i + 1).padStart(3, '0')}`,
  content: `This is message number ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  createdAt: '2026-01-29T00:00:00Z',
  updatedAt: '2026-01-29T00:00:00Z',
}));

export const Default: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    msw: {
      handlers: [
        getGetAllMessagesMockHandler(() => ({
          content: mockMessages,
          page: {
            size: 20,
            number: 0,
            totalElements: mockMessages.length,
            totalPages: 1,
          },
        })),
      ],
    },
  },
};

export const Loading: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/messages', async () => {
          await delay(10000);
          return HttpResponse.json({
            content: mockMessages,
            page: {
              size: 20,
              number: 0,
              totalElements: mockMessages.length,
              totalPages: 1,
            },
          });
        }),
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    msw: {
      handlers: [
        getGetAllMessagesMockHandler(() => ({
          content: [],
          page: {
            size: 20,
            number: 0,
            totalElements: 0,
            totalPages: 0,
          },
        })),
      ],
    },
  },
};

export const Error: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/messages', async () => {
          await delay(1000);
          return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }),
      ],
    },
  },
};

export const ManyMessages: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    msw: {
      handlers: [
        getGetAllMessagesMockHandler(() => ({
          content: manyMessages,
          page: {
            size: 20,
            number: 0,
            totalElements: manyMessages.length,
            totalPages: Math.ceil(manyMessages.length / 20),
          },
        })),
      ],
    },
  },
};

export const Mobile: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    msw: {
      handlers: [
        getGetAllMessagesMockHandler(() => ({
          content: mockMessages,
          page: {
            size: 20,
            number: 0,
            totalElements: mockMessages.length,
            totalPages: 1,
          },
        })),
      ],
    },
  },
};

/**
 * ADMIN role user sees all edit/delete buttons
 * Uses default ADMIN user from global decorator
 */
export const AdminRole: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    msw: {
      handlers: [
        getGetAllMessagesMockHandler(() => ({
          content: mockMessages,
          page: {
            size: 20,
            number: 0,
            totalElements: mockMessages.length,
            totalPages: 1,
          },
        })),
      ],
    },
  },
};

/**
 * VIEWER role user sees read-only mode with info message
 * Edit and delete buttons are hidden
 */
export const ViewerRole: Story = {
  args: {
    onEdit: (message) => console.log('Edit:', message),
    onDelete: (message) => console.log('Delete:', message),
  },
  parameters: {
    msw: {
      handlers: [
        getGetAllMessagesMockHandler(() => ({
          content: mockMessages,
          page: {
            size: 20,
            number: 0,
            totalElements: mockMessages.length,
            totalPages: 1,
          },
        })),
      ],
    },
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
