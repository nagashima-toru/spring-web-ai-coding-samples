import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Plus } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Button } from '@/core/components/ui/button';

const meta = {
  title: 'Common/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Messages',
    description: 'Manage your messages and content',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Messages',
    description: 'Manage your messages and content',
    action: (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        New Message
      </Button>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Settings',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This is a Very Long Page Title That Might Wrap',
    description: 'This is also a long description that provides additional context about the page',
  },
};

export const MultipleActions: Story = {
  args: {
    title: 'Dashboard',
    description: 'Overview of your application',
    action: (
      <div className="flex gap-2">
        <Button variant="outline">Export</Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>
    ),
  },
};

export const AllVariants: Story = {
  args: {
    title: 'Showcase of all variants',
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Default (with description)</p>
        <PageHeader title="Messages" description="Manage your messages and content" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">With Action Button</p>
        <PageHeader
          title="Messages"
          description="Manage your messages and content"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          }
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Title Only</p>
        <PageHeader title="Settings" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Multiple Actions</p>
        <PageHeader
          title="Dashboard"
          description="Overview of your application"
          action={
            <div className="flex gap-2">
              <Button variant="outline">Export</Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          }
        />
      </div>
    </div>
  ),
};
