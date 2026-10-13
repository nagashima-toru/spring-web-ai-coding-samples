import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/core/components/Pagination';
import { createLocaleWrapper } from '../../unit/helpers/localeTestHelper';

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
      render(<Pagination {...defaultProps} totalPages={5} totalItems={50} />, {
        wrapper: createLocaleWrapper(),
      });

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('currentPage <= 3 の場合、1-4 と ... と totalPages を表示する', () => {
      render(<Pagination {...defaultProps} currentPage={2} totalPages={10} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('currentPage >= totalPages - 2 の場合、1 と ... と 最後の4ページを表示する', () => {
      render(<Pagination {...defaultProps} currentPage={9} totalPages={10} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('中間ページの場合、1 と ... と currentPage周辺 と ... と totalPages を表示する', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />, {
        wrapper: createLocaleWrapper(),
      });

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
      render(<Pagination {...defaultProps} currentPage={2} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByText('全100件中 11〜20件を表示')).toBeInTheDocument();
    });

    it('totalItems が 0 の場合、startItem も 0 を表示する', () => {
      render(<Pagination {...defaultProps} totalItems={0} totalPages={0} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByText('全0件中 0〜0件を表示')).toBeInTheDocument();
    });

    it('英語ロケールの場合、英語で表示する', () => {
      render(<Pagination {...defaultProps} currentPage={2} />, {
        wrapper: createLocaleWrapper('en'),
      });

      expect(screen.getByText('Showing 11 to 20 of 100 results')).toBeInTheDocument();
      expect(screen.getByLabelText('Per page:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Previous/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next/ })).toBeInTheDocument();
    });

    it('最後のページで正しい endItem を表示する', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalItems={95} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByText('全95件中 91〜95件を表示')).toBeInTheDocument();
    });
  });

  describe('ページサイズの変更', () => {
    it('ページサイズを変更したとき onPageSizeChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />, { wrapper: createLocaleWrapper() });

      const select = screen.getByLabelText('表示件数:');
      await user.selectOptions(select, '25');

      expect(mockOnPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('利用可能なページサイズオプションを表示する', () => {
      render(<Pagination {...defaultProps} />, { wrapper: createLocaleWrapper() });

      const select = screen.getByLabelText('表示件数:') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.value);

      expect(options).toEqual(['10', '25', '50', '100']);
    });
  });

  describe('ページ遷移', () => {
    it('ページ番号をクリックしたとき onPageChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />, { wrapper: createLocaleWrapper() });

      const page3Button = screen.getByRole('button', { name: '3' });
      await user.click(page3Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('Previous ボタンをクリックしたとき onPageChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} />, { wrapper: createLocaleWrapper() });

      const prevButton = screen.getByRole('button', { name: /前へ/ });
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('Next ボタンをクリックしたとき onPageChange を呼ぶ', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} />, { wrapper: createLocaleWrapper() });

      const nextButton = screen.getByRole('button', { name: /次へ/ });
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(6);
    });

    it('currentPage が 1 のとき Previous ボタンを無効化する', () => {
      render(<Pagination {...defaultProps} currentPage={1} />, { wrapper: createLocaleWrapper() });

      const prevButton = screen.getByRole('button', { name: /前へ/ });
      expect(prevButton).toBeDisabled();
    });

    it('currentPage が totalPages のとき Next ボタンを無効化する', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={10} />, {
        wrapper: createLocaleWrapper(),
      });

      const nextButton = screen.getByRole('button', { name: /次へ/ });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('現在のページの表示', () => {
    it('現在のページのボタンが default variant になる', () => {
      render(<Pagination {...defaultProps} currentPage={3} />, { wrapper: createLocaleWrapper() });

      const currentPageButton = screen.getByRole('button', { name: '3' });
      expect(currentPageButton).toHaveClass('bg-primary');
    });
  });
});
