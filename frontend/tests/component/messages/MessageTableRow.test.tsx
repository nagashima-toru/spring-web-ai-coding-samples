import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MessageTableRow, MessageCard } from '@/features/messages/components/MessageTableRow';
import { MessageResponse } from '@/core/api/generated/models';
import { AuthContext } from '@/core/auth/AuthContext';
import { ROLES } from '@/core/auth/roles';
import type { UserResponse } from '@/core/api/generated/models';
import type { ReactNode } from 'react';

// Mock useRouter and usePathname (required by AuthContext)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

describe('MessageTableRow', () => {
  const mockMessage: MessageResponse = {
    id: 1,
    code: 'TEST001',
    content: 'Test content',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const adminUser: UserResponse = { username: 'admin', role: ROLES.ADMIN };
  const viewerUser: UserResponse = { username: 'viewer', role: ROLES.VIEWER };

  const AdminWrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider
      value={{
        user: adminUser,
        isLoading: false,
        error: null,
        refetch: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  const ViewerWrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider
      value={{
        user: viewerUser,
        isLoading: false,
        error: null,
        refetch: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  it('メッセージ情報が表示される', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
          </tbody>
        </table>
      </AdminWrapper>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('TEST001')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('ADMIN ロールの場合、編集ボタンクリックで onEdit が呼ばれる', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
          </tbody>
        </table>
      </AdminWrapper>
    );

    const editButton = screen.getByRole('button', { name: /edit message TEST001/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockMessage);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('ADMIN ロールの場合、削除ボタンクリックで onDelete が呼ばれる', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
          </tbody>
        </table>
      </AdminWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete message TEST001/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockMessage);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('onEdit が未指定の場合でもエラーが発生しない', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onDelete={onDelete} />
          </tbody>
        </table>
      </AdminWrapper>
    );

    const editButton = screen.getByRole('button', { name: /edit message TEST001/i });
    await user.click(editButton);

    // エラーが発生しないことを確認
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('onDelete が未指定の場合でもエラーが発生しない', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <AdminWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onEdit={onEdit} />
          </tbody>
        </table>
      </AdminWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete message TEST001/i });
    await user.click(deleteButton);

    // エラーが発生しないことを確認
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('VIEWER ロールの場合、編集・削除ボタンが表示されない', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <ViewerWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
          </tbody>
        </table>
      </ViewerWrapper>
    );

    expect(screen.queryByRole('button', { name: /edit message TEST001/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /delete message TEST001/i })
    ).not.toBeInTheDocument();
  });

  it('VIEWER ロールの場合、行クリックで onEdit が呼ばれる', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <ViewerWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
          </tbody>
        </table>
      </ViewerWrapper>
    );

    const row = screen.getByTestId(`message-row-${mockMessage.id}`);
    await user.click(row);

    expect(onEdit).toHaveBeenCalledWith(mockMessage);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('ADMIN ロールの場合、行クリックで onEdit が呼ばれない', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <table>
          <tbody>
            <MessageTableRow message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
          </tbody>
        </table>
      </AdminWrapper>
    );

    const row = screen.getByTestId(`message-row-${mockMessage.id}`);
    await user.click(row);

    // ADMIN ロールでは行クリックで onEdit は呼ばれない
    expect(onEdit).not.toHaveBeenCalled();
  });
});

describe('MessageCard', () => {
  const mockMessage: MessageResponse = {
    id: 2,
    code: 'MOBILE001',
    content: 'Mobile view content',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  };

  const adminUser: UserResponse = { username: 'admin', role: ROLES.ADMIN };
  const viewerUser: UserResponse = { username: 'viewer', role: ROLES.VIEWER };

  const AdminWrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider
      value={{
        user: adminUser,
        isLoading: false,
        error: null,
        refetch: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  const ViewerWrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider
      value={{
        user: viewerUser,
        isLoading: false,
        error: null,
        refetch: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );

  it('メッセージ情報が表示される', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <MessageCard message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
      </AdminWrapper>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('MOBILE001')).toBeInTheDocument();
    expect(screen.getByText('Mobile view content')).toBeInTheDocument();
    expect(screen.getByText(/ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Code:/i)).toBeInTheDocument();
    expect(screen.getByText(/Content:/i)).toBeInTheDocument();
  });

  it('ADMIN ロールの場合、編集ボタンクリックで onEdit が呼ばれる', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <MessageCard message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
      </AdminWrapper>
    );

    const editButton = screen.getByRole('button', { name: /edit message MOBILE001/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockMessage);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('ADMIN ロールの場合、削除ボタンクリックで onDelete が呼ばれる', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <MessageCard message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
      </AdminWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete message MOBILE001/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockMessage);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('onEdit が未指定の場合でもエラーが発生しない', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <MessageCard message={mockMessage} onDelete={onDelete} />
      </AdminWrapper>
    );

    const editButton = screen.getByRole('button', { name: /edit message MOBILE001/i });
    await user.click(editButton);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('onDelete が未指定の場合でもエラーが発生しない', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <AdminWrapper>
        <MessageCard message={mockMessage} onEdit={onEdit} />
      </AdminWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete message MOBILE001/i });
    await user.click(deleteButton);

    expect(onEdit).not.toHaveBeenCalled();
  });

  it('VIEWER ロールの場合、編集・削除ボタンが表示されない', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <ViewerWrapper>
        <MessageCard message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
      </ViewerWrapper>
    );

    expect(
      screen.queryByRole('button', { name: /edit message MOBILE001/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /delete message MOBILE001/i })
    ).not.toBeInTheDocument();
  });

  it('VIEWER ロールの場合、カードクリックで onEdit が呼ばれる', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <ViewerWrapper>
        <MessageCard message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
      </ViewerWrapper>
    );

    const card = screen.getByTestId(`message-row-${mockMessage.id}`);
    await user.click(card);

    expect(onEdit).toHaveBeenCalledWith(mockMessage);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('ADMIN ロールの場合、カードクリックで onEdit が呼ばれない', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AdminWrapper>
        <MessageCard message={mockMessage} onEdit={onEdit} onDelete={onDelete} />
      </AdminWrapper>
    );

    const card = screen.getByTestId(`message-row-${mockMessage.id}`);
    await user.click(card);

    // ADMIN ロールではカードクリックで onEdit は呼ばれない
    expect(onEdit).not.toHaveBeenCalled();
  });
});
