import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageModal } from '@/features/messages/components/MessageModal';
import { MessageResponse, UserResponse } from '@/core/api/generated/models';
import { AuthContext } from '@/core/auth/AuthContext';
import { ROLES } from '@/core/auth/roles';
import { createLocaleWrapper } from '../../unit/helpers/localeTestHelper';

// Mock MessageForm component
vi.mock('@/features/messages/components/MessageForm', () => ({
  MessageForm: ({
    onSubmit,
    initialData,
    isSubmitting,
    onCancel,
    error,
    disabled,
  }: {
    onSubmit: (data: { code: string; content: string }) => void;
    initialData?: MessageResponse;
    isSubmitting: boolean;
    onCancel: () => void;
    error?: unknown;
    disabled?: boolean;
  }) => (
    <div data-testid="message-form">
      <div data-testid="form-initial-data">{JSON.stringify(initialData)}</div>
      <div data-testid="form-is-submitting">{String(isSubmitting)}</div>
      <div data-testid="form-error">{error ? 'has-error' : 'no-error'}</div>
      <div data-testid="form-disabled">{String(disabled || false)}</div>
      <button onClick={() => onSubmit({ code: 'TEST', content: 'Test' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

const createWrapper = (user: UserResponse | null = { username: 'admin', role: ROLES.ADMIN }) => {
  const LocaleWrapper = createLocaleWrapper();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <LocaleWrapper>
      <AuthContext.Provider
        value={{
          user,
          isLoading: false,
          error: null,
          refetch: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    </LocaleWrapper>
  );

  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('MessageModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSubmit: mockOnSubmit,
    mode: 'create' as const,
  };

  it('create モードで正しいタイトルと説明を表示する', () => {
    const Wrapper = createWrapper();
    render(<MessageModal {...defaultProps} mode="create" />, { wrapper: Wrapper });

    expect(screen.getByText('メッセージ作成')).toBeInTheDocument();
    expect(screen.getByText('新しいメッセージの詳細を入力してください。')).toBeInTheDocument();
  });

  it('edit モードで正しいタイトルと説明を表示する', () => {
    const Wrapper = createWrapper();
    render(<MessageModal {...defaultProps} mode="edit" />, { wrapper: Wrapper });

    expect(screen.getByText('メッセージ編集')).toBeInTheDocument();
    expect(screen.getByText('メッセージの詳細を更新してください。')).toBeInTheDocument();
  });

  it('MessageForm に initialData を渡す', () => {
    const Wrapper = createWrapper();
    const initialData: MessageResponse = {
      id: 1,
      code: 'TEST',
      content: 'Test content',
      createdAt: '2026-01-29T00:00:00Z',
      updatedAt: '2026-01-29T00:00:00Z',
    };

    render(<MessageModal {...defaultProps} initialData={initialData} />, { wrapper: Wrapper });

    const formInitialData = screen.getByTestId('form-initial-data');
    expect(formInitialData).toHaveTextContent(JSON.stringify(initialData));
  });

  it('MessageForm に isSubmitting を渡す', () => {
    const Wrapper = createWrapper();
    render(<MessageModal {...defaultProps} isSubmitting={true} />, { wrapper: Wrapper });

    const formIsSubmitting = screen.getByTestId('form-is-submitting');
    expect(formIsSubmitting).toHaveTextContent('true');
  });

  it('MessageForm に error を渡す', () => {
    const Wrapper = createWrapper();
    const error = new Error('Test error');

    render(<MessageModal {...defaultProps} error={error} />, { wrapper: Wrapper });

    const formError = screen.getByTestId('form-error');
    expect(formError).toHaveTextContent('has-error');
  });

  it('MessageForm の onCancel が呼ばれたとき onOpenChange(false) を呼ぶ', () => {
    const Wrapper = createWrapper();
    render(<MessageModal {...defaultProps} />, { wrapper: Wrapper });

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('MessageForm の onSubmit が呼ばれたとき onSubmit を呼ぶ', () => {
    const Wrapper = createWrapper();
    render(<MessageModal {...defaultProps} />, { wrapper: Wrapper });

    const submitButton = screen.getByText('Submit');
    submitButton.click();

    expect(mockOnSubmit).toHaveBeenCalledWith({ code: 'TEST', content: 'Test' });
  });

  it('open=false のときモーダルを表示しない', () => {
    const Wrapper = createWrapper();
    render(<MessageModal {...defaultProps} open={false} />, { wrapper: Wrapper });

    // Dialog が閉じているときは MessageForm も表示されない
    expect(screen.queryByTestId('message-form')).not.toBeInTheDocument();
  });

  it('isSubmitting がデフォルトで false', () => {
    const Wrapper = createWrapper();
    render(<MessageModal {...defaultProps} />, { wrapper: Wrapper });

    const formIsSubmitting = screen.getByTestId('form-is-submitting');
    expect(formIsSubmitting).toHaveTextContent('false');
  });

  describe('権限制御', () => {
    it('ADMIN ロールの場合、create モードでモーダルが表示される', () => {
      const Wrapper = createWrapper({ username: 'admin', role: ROLES.ADMIN });
      render(<MessageModal {...defaultProps} mode="create" />, { wrapper: Wrapper });

      expect(screen.getByTestId('message-modal')).toBeInTheDocument();
      expect(screen.getByText('メッセージ作成')).toBeInTheDocument();
    });

    it('VIEWER ロールの場合、create モードでモーダルが表示されない', () => {
      const Wrapper = createWrapper({ username: 'viewer', role: ROLES.VIEWER });
      render(<MessageModal {...defaultProps} mode="create" />, { wrapper: Wrapper });

      expect(screen.queryByTestId('message-modal')).not.toBeInTheDocument();
      expect(screen.queryByText('メッセージ作成')).not.toBeInTheDocument();
    });

    it('VIEWER ロールの場合でも、edit モードではモーダルが表示される', () => {
      const Wrapper = createWrapper({ username: 'viewer', role: ROLES.VIEWER });
      const initialData: MessageResponse = {
        id: 1,
        code: 'TEST',
        content: 'Test content',
        createdAt: '2026-01-29T00:00:00Z',
        updatedAt: '2026-01-29T00:00:00Z',
      };

      render(<MessageModal {...defaultProps} mode="edit" initialData={initialData} />, {
        wrapper: Wrapper,
      });

      expect(screen.getByTestId('message-modal')).toBeInTheDocument();
      expect(screen.getByText('メッセージ編集')).toBeInTheDocument();
    });
  });

  describe('読み取り専用モード', () => {
    it('isReadOnly が true の場合、タイトルが "メッセージ詳細" になる', () => {
      const Wrapper = createWrapper();
      render(<MessageModal {...defaultProps} mode="edit" isReadOnly={true} />, {
        wrapper: Wrapper,
      });

      expect(screen.getByText('メッセージ詳細')).toBeInTheDocument();
      expect(screen.queryByText('メッセージ編集')).not.toBeInTheDocument();
    });

    it('isReadOnly が true の場合、説明が "メッセージ詳細（閲覧のみ）" になる', () => {
      const Wrapper = createWrapper();
      render(<MessageModal {...defaultProps} mode="edit" isReadOnly={true} />, {
        wrapper: Wrapper,
      });

      expect(screen.getByText('メッセージ詳細（閲覧のみ）')).toBeInTheDocument();
      expect(screen.queryByText('メッセージの詳細を更新してください。')).not.toBeInTheDocument();
    });

    it('isReadOnly が true の場合、MessageForm に disabled={true} が渡される', () => {
      const Wrapper = createWrapper();
      render(<MessageModal {...defaultProps} mode="edit" isReadOnly={true} />, {
        wrapper: Wrapper,
      });

      const formDisabled = screen.getByTestId('form-disabled');
      expect(formDisabled).toHaveTextContent('true');
    });

    it('isReadOnly が false の場合、MessageForm に disabled={false} が渡される', () => {
      const Wrapper = createWrapper();
      render(<MessageModal {...defaultProps} mode="edit" isReadOnly={false} />, {
        wrapper: Wrapper,
      });

      const formDisabled = screen.getByTestId('form-disabled');
      expect(formDisabled).toHaveTextContent('false');
    });

    it('isReadOnly がデフォルトで false', () => {
      const Wrapper = createWrapper();
      render(<MessageModal {...defaultProps} mode="edit" />, { wrapper: Wrapper });

      expect(screen.getByText('メッセージ編集')).toBeInTheDocument();
      const formDisabled = screen.getByTestId('form-disabled');
      expect(formDisabled).toHaveTextContent('false');
    });
  });
});
