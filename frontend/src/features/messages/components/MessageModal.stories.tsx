import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MessageModal } from './MessageModal';
import { MessageResponse } from '@/core/api/generated/models';
import { useState } from 'react';
import { AuthContext } from '@/core/auth/AuthContext';
import { ROLES } from '@/core/auth/roles';

const meta = {
  title: 'Messages/MessageModal',
  component: MessageModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMessage: MessageResponse = {
  id: 1,
  code: 'TEST001',
  content: 'This is a test message for editing.',
  createdAt: '2026-01-29T00:00:00Z',
  updatedAt: '2026-01-29T00:00:00Z',
};

export const CreateMode: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: (data) => console.log('Submit:', data),
    mode: 'create',
    isSubmitting: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <MessageModal
        {...args}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => {
          console.log('Submit:', data);
          setOpen(false);
        }}
      />
    );
  },
};

export const EditMode: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: (data) => console.log('Submit:', data),
    mode: 'edit',
    initialData: mockMessage,
    isSubmitting: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <MessageModal
        {...args}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => {
          console.log('Submit:', data);
          setOpen(false);
        }}
      />
    );
  },
};

export const Submitting: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: (data) => console.log('Submit:', data),
    mode: 'create',
    isSubmitting: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return <MessageModal {...args} open={open} onOpenChange={setOpen} />;
  },
};

/**
 * ADMIN role can see create modal
 */
export const CreateModeAdmin: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: (data) => console.log('Submit:', data),
    mode: 'create',
    isSubmitting: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <AuthContext.Provider
        value={{
          user: { username: 'admin', role: ROLES.ADMIN },
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        <MessageModal
          {...args}
          open={open}
          onOpenChange={setOpen}
          onSubmit={(data) => {
            console.log('Submit:', data);
            setOpen(false);
          }}
        />
      </AuthContext.Provider>
    );
  },
};

/**
 * VIEWER role cannot see create modal (returns null)
 */
export const CreateModeViewer: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: (data) => console.log('Submit:', data),
    mode: 'create',
    isSubmitting: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <AuthContext.Provider
        value={{
          user: { username: 'viewer', role: ROLES.VIEWER },
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        <div className="p-4 border rounded">
          <p className="text-sm text-gray-600 mb-4">
            VIEWER role: Modal should not be displayed (component returns null)
          </p>
          <MessageModal
            {...args}
            open={open}
            onOpenChange={setOpen}
            onSubmit={(data) => {
              console.log('Submit:', data);
              setOpen(false);
            }}
          />
        </div>
      </AuthContext.Provider>
    );
  },
};

/**
 * VIEWER role can see edit modal
 */
export const EditModeViewer: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: (data) => console.log('Submit:', data),
    mode: 'edit',
    initialData: mockMessage,
    isSubmitting: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <AuthContext.Provider
        value={{
          user: { username: 'viewer', role: ROLES.VIEWER },
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        <MessageModal
          {...args}
          open={open}
          onOpenChange={setOpen}
          onSubmit={(data) => {
            console.log('Submit:', data);
            setOpen(false);
          }}
        />
      </AuthContext.Provider>
    );
  },
};

/**
 * VIEWER role sees edit modal in read-only mode
 */
export const ReadOnlyMode: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: (data) => console.log('Submit:', data),
    mode: 'edit',
    initialData: mockMessage,
    isSubmitting: false,
    isReadOnly: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <AuthContext.Provider
        value={{
          user: { username: 'viewer', role: ROLES.VIEWER },
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        <MessageModal
          {...args}
          open={open}
          onOpenChange={setOpen}
          onSubmit={(data) => {
            console.log('Submit:', data);
            setOpen(false);
          }}
        />
      </AuthContext.Provider>
    );
  },
};
