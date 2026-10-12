import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pagination } from './Pagination';
import { useState } from 'react';

const meta = {
  title: 'Messages/Pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 100,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
  render: (args) => {
    const [currentPage, setCurrentPage] = useState(args.currentPage);
    const [pageSize, setPageSize] = useState(args.pageSize);
    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    );
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    pageSize: 10,
    totalItems: 100,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
  render: (args) => {
    const [currentPage, setCurrentPage] = useState(args.currentPage);
    const [pageSize, setPageSize] = useState(args.pageSize);
    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    );
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    pageSize: 10,
    totalItems: 100,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
  render: (args) => {
    const [currentPage, setCurrentPage] = useState(args.currentPage);
    const [pageSize, setPageSize] = useState(args.pageSize);
    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    );
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 5,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
  render: (args) => {
    const [currentPage, setCurrentPage] = useState(args.currentPage);
    const [pageSize, setPageSize] = useState(args.pageSize);
    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    );
  },
};
