import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/core/components/Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 100,
    onPageChange: mockOnPageChange,
    onPageSizeChange: mockOnPageSizeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ページ番号の表示', () => {
    it('totalPages <= 5 の場合、すべてのページを表示する', () => {
      render(<Pagination {...defaultProps} totalPages={5} totalItems={50} />);

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('currentPage <= 3 の場合、1-4 と ... と totalPages を表示する', () => {
      render(<Pagination {...defaultProps} currentPage={2} totalPages={10} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('currentPage >= totalPages - 2 の場合、1 と ... と 最後の4ページを表示する', () => {
      render(<Pagination {...defaultProps} currentPage={9} totalPages={10} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('中間ページの場合、1 と ... と currentPage周辺 と ... と totalPages を表示する', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      const ellipsis = screen.getAllByText('...');
      expect(ellipsis).toHaveLength(2);
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });
  });

  describe('アイテム数の表示', () => {
    it('正しいアイテム範囲を表示する', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);

      expect(screen.getByText(/Showing 11 to 20 of 100 results/)).toBeInTheDocument();
    });

    it('totalItems が 0 の場合、startItem も 0 を表示する', () => {
      render(<Pagination {...defaultProps} totalItems={0} totalPages={0} />);

      expect(screen.getByText(/Showing 0 to 0 of 0 results/)).toBeInTheDocument();
    });

    it('最後のページで正しい endItem を表示する', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalItems={95} />);

      expect(screen.getByText(/Showing 91 to 95 of 95 results/)).toBeInTheDocument();
    });
  });

  describe('ページサイズの変更', () => {
    it('ページサイズを変更したとき onPageSizeChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />);

      const select = screen.getByLabelText('Per page:');
      await user.selectOptions(select, '25');

      expect(mockOnPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('利用可能なページサイズオプションを表示する', () => {
      render(<Pagination {...defaultProps} />);

      const select = screen.getByLabelText('Per page:') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.value);

      expect(options).toEqual(['10', '25', '50', '100']);
    });
  });

  describe('ページ遷移', () => {
    it('ページ番号をクリックしたとき onPageChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />);

      const page3Button = screen.getByRole('button', { name: '3' });
      await user.click(page3Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('Previous ボタンをクリックしたとき onPageChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} />);

      const prevButton = screen.getByRole('button', { name: /Previous/ });
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('Next ボタンをクリックしたとき onPageChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} />);

      const nextButton = screen.getByRole('button', { name: /Next/ });
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(6);
    });

    it('currentPage が 1 のとき Previous ボタンを無効化する', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByRole('button', { name: /Previous/ });
      expect(prevButton).toBeDisabled();
    });

    it('currentPage が totalPages のとき Next ボタンを無効化する', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={10} />);

      const nextButton = screen.getByRole('button', { name: /Next/ });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('現在のページの表示', () => {
    it('現在のページのボタンが default variant になる', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const currentPageButton = screen.getByRole('button', { name: '3' });
      expect(currentPageButton).toHaveClass('bg-primary');
    });
  });
});
