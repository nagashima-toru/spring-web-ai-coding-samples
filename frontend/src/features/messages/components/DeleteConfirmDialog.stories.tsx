import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { MessageResponse } from '@/core/api/generated/models';
import { useState } from 'react';

const meta = {
  title: 'Messages/DeleteConfirmDialog',
  component: DeleteConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DeleteConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMessage: MessageResponse = {
  id: 1,
  code: 'TEST001',
  content: 'This is a test message that will be deleted.',
  createdAt: '2026-01-29T00:00:00Z',
  updatedAt: '2026-01-29T00:00:00Z',
};

const longContentMessage: MessageResponse = {
  id: 2,
  code: 'LONG_MESSAGE',
  content:
    'This is a very long message content that demonstrates how the dialog handles lengthy text. It should wrap properly and display in a readable format within the dialog. This helps us verify that the UI remains usable even with substantial content.',
  createdAt: '2026-01-29T00:00:00Z',
  updatedAt: '2026-01-29T00:00:00Z',
};

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => console.log('Delete confirmed'),
    message: mockMessage,
    isDeleting: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <DeleteConfirmDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          console.log('Delete confirmed');
          setOpen(false);
        }}
      />
    );
  },
};

export const Deleting: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => console.log('Delete confirmed'),
    message: mockMessage,
    isDeleting: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <DeleteConfirmDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          console.log('Delete confirmed');
        }}
      />
    );
  },
};

export const LongContent: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => console.log('Delete confirmed'),
    message: longContentMessage,
    isDeleting: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <DeleteConfirmDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          console.log('Delete confirmed');
          setOpen(false);
        }}
      />
    );
  },
};
