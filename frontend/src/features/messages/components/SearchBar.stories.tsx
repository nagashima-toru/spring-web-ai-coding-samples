import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Messages/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <SearchBar {...args} value={value} onChange={setValue} />;
  },
};

export const WithValue: Story = {
  args: {
    value: 'test message',
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <SearchBar {...args} value={value} onChange={setValue} />;
  },
};
