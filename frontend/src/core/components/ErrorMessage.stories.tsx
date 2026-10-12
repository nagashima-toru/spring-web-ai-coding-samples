import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ErrorMessage } from './ErrorMessage';

const meta = {
  title: 'Common/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['inline', 'card'],
    },
    message: {
      control: 'text',
    },
  },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'An error occurred',
  },
};

export const NetworkError: Story = {
  args: {
    message: 'Failed to fetch data. Please check your internet connection.',
  },
};

export const ValidationError: Story = {
  args: {
    message: 'Please enter a valid email address.',
  },
};

export const CardVariant: Story = {
  args: {
    message: 'Something went wrong. Please try again later.',
    variant: 'card',
  },
};

export const CardVariantLongMessage: Story = {
  args: {
    message:
      'An unexpected error occurred while processing your request. This could be due to a server issue or a network problem. Please try again in a few moments. If the problem persists, please contact support.',
    variant: 'card',
  },
};

export const AllVariants: Story = {
  args: {
    message: 'Showcase of all variants',
  },
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div className="space-y-2">
        <p className="text-sm font-semibold">Inline Variant</p>
        <ErrorMessage message="This is an inline error message" variant="inline" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Card Variant</p>
        <ErrorMessage message="This is a card error message with more details" variant="card" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Network Error (Inline)</p>
        <ErrorMessage message="Failed to connect to the server" variant="inline" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Validation Error (Card)</p>
        <ErrorMessage message="Please fill in all required fields correctly" variant="card" />
      </div>
    </div>
  ),
};
