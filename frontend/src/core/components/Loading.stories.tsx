import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Loading } from './Loading';

const meta = {
  title: 'Common/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    text: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithText: Story = {
  args: {
    text: 'Loading...',
  },
};

export const AllSizes: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2">
        <Loading size="sm" />
        <p className="text-xs text-muted-foreground">Small</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loading size="md" />
        <p className="text-xs text-muted-foreground">Medium (Default)</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loading size="lg" />
        <p className="text-xs text-muted-foreground">Large</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loading size="md" text="Loading data..." />
        <p className="text-xs text-muted-foreground">With Text</p>
      </div>
    </div>
  ),
};
