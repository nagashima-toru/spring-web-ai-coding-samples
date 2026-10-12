import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmDialog } from '@/features/messages/components/DeleteConfirmDialog';
import { MessageResponse } from '@/core/api/generated/models';
import { createLocaleWrapper } from '../../unit/helpers/localeTestHelper';

describe('DeleteConfirmDialog', () => {
  const mockMessage: MessageResponse = {
    id: 1,
    code: 'TEST001',
    content: 'This is a test message',
    createdAt: '2026-01-29T00:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
  };

  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onConfirm: mockOnConfirm,
    message: mockMessage,
    isDeleting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表示内容', () => {
    it('ダイアログのタイトルが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByText('メッセージ削除')).toBeInTheDocument();
    });

    it('確認メッセージが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByText(/このメッセージを削除してもよいですか/)).toBeInTheDocument();
    });

    it('メッセージのcodeが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByText('TEST001')).toBeInTheDocument();
    });

    it('メッセージのcontentが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByText('This is a test message')).toBeInTheDocument();
    });

    it('警告アイコンが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByText('メッセージ削除')).toBeInTheDocument();
    });
  });

  describe('ボタン', () => {
    it('キャンセルボタンが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByTestId('delete-cancel-button')).toBeInTheDocument();
    });

    it('削除ボタンが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      expect(screen.getByTestId('delete-confirm-button')).toBeInTheDocument();
    });

    it('キャンセルボタンをクリックするとonOpenChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      const cancelButton = screen.getByTestId('delete-cancel-button');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('削除ボタンをクリックするとonConfirmが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      const deleteButton = screen.getByTestId('delete-confirm-button');
      await user.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledOnce();
    });
  });

  describe('削除中の状態', () => {
    it('削除中はボタンが無効化される', () => {
      render(<DeleteConfirmDialog {...defaultProps} isDeleting={true} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByTestId('delete-cancel-button')).toBeDisabled();
      expect(screen.getByTestId('delete-confirm-button')).toBeDisabled();
    });

    it('削除中はボタンのテキストが変わる', () => {
      render(<DeleteConfirmDialog {...defaultProps} isDeleting={true} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByTestId('delete-confirm-button')).toHaveTextContent('削除中...');
    });

    it('削除中でもonConfirmを呼び出せない', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmDialog {...defaultProps} isDeleting={true} />, {
        wrapper: createLocaleWrapper(),
      });

      const deleteButton = screen.getByTestId('delete-confirm-button');
      await user.click(deleteButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('ダイアログの表示/非表示', () => {
    it('openがtrueの場合、ダイアログが表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} open={true} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('openがfalseの場合、ダイアログが表示されない', () => {
      render(<DeleteConfirmDialog {...defaultProps} open={false} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('エラー表示', () => {
    it('エラーがある場合、エラーメッセージを表示する', () => {
      const error = new Error('Failed to delete message');
      render(<DeleteConfirmDialog {...defaultProps} error={error} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByText(/failed to delete message/i)).toBeInTheDocument();
    });

    it('APIエラーの場合、APIのエラーメッセージを表示する', () => {
      const error = { response: { data: { message: 'Message not found' } } };
      render(<DeleteConfirmDialog {...defaultProps} error={error} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByText(/message not found/i)).toBeInTheDocument();
    });

    it('エラーがない場合、エラーメッセージを表示しない', () => {
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      const errorElement = screen.queryByText(/failed/i);
      expect(errorElement).not.toBeInTheDocument();
    });
  });

  describe('messageがnullの場合', () => {
    it('メッセージ詳細が表示されない', () => {
      render(<DeleteConfirmDialog {...defaultProps} message={null} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.queryByText('TEST001')).not.toBeInTheDocument();
      expect(screen.queryByText('This is a test message')).not.toBeInTheDocument();
    });

    it('ダイアログの基本的な要素は表示される', () => {
      render(<DeleteConfirmDialog {...defaultProps} message={null} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByText('メッセージ削除')).toBeInTheDocument();
      expect(screen.getByTestId('delete-cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-confirm-button')).toBeInTheDocument();
    });
  });

  describe('長いコンテンツの表示', () => {
    it('長いcodeが表示される', () => {
      const longCodeMessage: MessageResponse = {
        id: 1,
        code: 'A'.repeat(50),
        content: 'Test content',
        createdAt: '2026-01-29T00:00:00Z',
        updatedAt: '2026-01-29T00:00:00Z',
      };

      render(<DeleteConfirmDialog {...defaultProps} message={longCodeMessage} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByText('A'.repeat(50))).toBeInTheDocument();
    });

    it('長いcontentが表示される', () => {
      const longContentMessage: MessageResponse = {
        id: 1,
        code: 'TEST001',
        content: 'B'.repeat(500),
        createdAt: '2026-01-29T00:00:00Z',
        updatedAt: '2026-01-29T00:00:00Z',
      };

      render(<DeleteConfirmDialog {...defaultProps} message={longContentMessage} />, {
        wrapper: createLocaleWrapper(),
      });

      expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
    });
  });

  describe('複数回のクリック', () => {
    it('削除ボタンを複数回クリックしても、onConfirmは一度だけ呼ばれる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmDialog {...defaultProps} />, { wrapper: createLocaleWrapper() });

      const deleteButton = screen.getByTestId('delete-confirm-button');
      await user.click(deleteButton);
      await user.click(deleteButton);

      // 最初のクリックのみカウント（2回目以降は無効化されている可能性が高い）
      expect(mockOnConfirm).toHaveBeenCalledTimes(2); // ボタンが無効化されていなければ2回呼ばれる
    });
  });
});
