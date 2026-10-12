import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { MessageTable } from '@/features/messages/components/MessageTable';
import { MessageResponse, UserResponse } from '@/core/api/generated/models';
import * as messageApi from '@/core/api/generated/message/message';
import { AuthContext } from '@/core/auth/AuthContext';
import { LocaleContext, type Locale } from '@/core/i18n/LocaleContext';
import { ROLES } from '@/core/auth/roles';
import { createLocaleWrapper } from '../../unit/helpers/localeTestHelper';
import jaMessages from '../../../messages/ja.json';
import enMessages from '../../../messages/en.json';

const messagesByLocale: Record<Locale, Record<string, unknown>> = {
  ja: jaMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

// Mock the API module
vi.mock('@/core/api/generated/message/message', () => ({
  useGetAllMessages: vi.fn(),
}));

// Mock next/navigation (required by AuthContext)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

const createWrapper = (
  user: UserResponse | null = { username: 'admin', role: ROLES.ADMIN },
  locale: Locale = 'ja'
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const LocaleWrapper = createLocaleWrapper(locale);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <LocaleWrapper>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </LocaleWrapper>
  );

  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

// Helper to wrap messages in MessagePage format
const createMessagePage = (messages: MessageResponse[]) => ({
  content: messages,
  page: {
    size: 20,
    number: 0,
    totalElements: messages.length,
    totalPages: Math.ceil(messages.length / 20),
  },
});

describe('MessageTable', () => {
  const mockMessages: MessageResponse[] = [
    {
      id: 1,
      code: 'MSG001',
      content: 'First message',
      createdAt: '2026-01-29T00:00:00Z',
      updatedAt: '2026-01-29T00:00:00Z',
    },
    {
      id: 2,
      code: 'MSG002',
      content: 'Second message',
      createdAt: '2026-01-29T00:00:00Z',
      updatedAt: '2026-01-29T00:00:00Z',
    },
    {
      id: 3,
      code: 'MSG003',
      content: 'Third message',
      createdAt: '2026-01-29T00:00:00Z',
      updatedAt: '2026-01-29T00:00:00Z',
    },
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('データ表示', () => {
    it('メッセージ一覧が正しく表示される', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getAllByText('MSG001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('First message').length).toBeGreaterThan(0);
      expect(screen.getAllByText('MSG002').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Second message').length).toBeGreaterThan(0);
      expect(screen.getAllByText('MSG003').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Third message').length).toBeGreaterThan(0);
    });

    it('IDが表示される', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    });

    it('編集ボタンと削除ボタンが表示される', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const editButtons = screen.getAllByLabelText(/edit message/i);
      const deleteButtons = screen.getAllByLabelText(/delete message/i);

      // Both desktop and mobile views are rendered, so expect 2x the number of messages
      expect(editButtons).toHaveLength(mockMessages.length * 2);
      expect(deleteButtons).toHaveLength(mockMessages.length * 2);
    });

    it('検索バーが表示される', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      // With 'ja' locale (default), placeholder should be in Japanese
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('コードまたはコンテンツで検索...')).toBeInTheDocument();
    });

    it('ページネーションが表示される', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/showing 1 to 3 of 3 results/i)).toBeInTheDocument();
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はローディングインジケーターを表示する', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/メッセージを読み込み中/)).toBeInTheDocument();
    });

    it('ローディング中はメッセージテーブルを表示しない', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('エラー発生時はエラーメッセージを表示する', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/メッセージの読み込みに失敗しました/)).toBeInTheDocument();
    });

    it('エラー発生時はメッセージテーブルを表示しない', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('空の状態', () => {
    it('メッセージが0件の場合、空のメッセージを表示する', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage([]),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/メッセージはありません/)).toBeInTheDocument();
      expect(screen.getByText(/最初のメッセージを作成してください/)).toBeInTheDocument();
    });
  });

  describe('検索機能', () => {
    it('検索クエリでフィルタリングできる', async () => {
      const user = userEvent.setup();

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'MSG001');

      await waitFor(() => {
        expect(screen.getAllByText('MSG001').length).toBeGreaterThan(0);
        expect(screen.queryByText('MSG002')).not.toBeInTheDocument();
        expect(screen.queryByText('MSG003')).not.toBeInTheDocument();
      });
    });

    it('検索結果が0件の場合、メッセージを表示する', async () => {
      const user = userEvent.setup();

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'NOTFOUND');

      await waitFor(() => {
        expect(screen.getByText(/検索条件に一致するメッセージはありません/)).toBeInTheDocument();
        expect(screen.getByText(/別の検索語を試してください/)).toBeInTheDocument();
      });
    });

    it('contentで検索できる', async () => {
      const user = userEvent.setup();

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'First');

      await waitFor(() => {
        expect(screen.getAllByText('First message').length).toBeGreaterThan(0);
        expect(screen.queryByText('Second message')).not.toBeInTheDocument();
        expect(screen.queryByText('Third message')).not.toBeInTheDocument();
      });
    });
  });

  describe('i18n', () => {
    it('言語切り替え後にプレースホルダーが即座に更新される', () => {
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const adminUser: UserResponse = { username: 'admin', role: ROLES.ADMIN };

      const renderWithLocale = (locale: Locale) => (
        <LocaleContext.Provider
          value={{ locale, setLocale: vi.fn(), messages: messagesByLocale[locale] }}
        >
          <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
            <QueryClientProvider client={queryClient}>
              <AuthContext.Provider
                value={{ user: adminUser, isLoading: false, error: null, refetch: () => {} }}
              >
                <MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />
              </AuthContext.Provider>
            </QueryClientProvider>
          </NextIntlClientProvider>
        </LocaleContext.Provider>
      );

      const { rerender } = render(renderWithLocale('ja'));
      expect(screen.getByTestId('search-input')).toHaveAttribute(
        'placeholder',
        'コードまたはコンテンツで検索...'
      );

      rerender(renderWithLocale('en'));
      expect(screen.getByTestId('search-input')).toHaveAttribute(
        'placeholder',
        'Search by code or content...'
      );
    });
  });

  describe('ソート機能', () => {
    it('IDでソートできる', async () => {
      const user = userEvent.setup();

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const idHeader = screen.getByRole('button', { name: /id/i });
      await user.click(idHeader);

      // 降順にソート
      const rows = screen.getAllByRole('row');
      const firstDataRow = within(rows[1]);
      expect(firstDataRow.getAllByText('3').length).toBeGreaterThan(0);
    });

    it('Codeでソートできる', async () => {
      const user = userEvent.setup();
      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage([
          {
            id: 1,
            code: 'CCC',
            content: 'Content C',
            createdAt: '2026-01-29T00:00:00Z',
            updatedAt: '2026-01-29T00:00:00Z',
          },
          {
            id: 2,
            code: 'AAA',
            content: 'Content A',
            createdAt: '2026-01-29T00:00:00Z',
            updatedAt: '2026-01-29T00:00:00Z',
          },
          {
            id: 3,
            code: 'BBB',
            content: 'Content B',
            createdAt: '2026-01-29T00:00:00Z',
            updatedAt: '2026-01-29T00:00:00Z',
          },
        ]),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const codeHeader = screen.getByRole('button', { name: /コードでソート/ });
      await user.click(codeHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstDataRow = within(rows[1]);
        expect(firstDataRow.getAllByText('AAA').length).toBeGreaterThan(0);
      });
    });
  });

  describe('ボタンアクション', () => {
    it('編集ボタンをクリックするとonEditが呼ばれる', async () => {
      const user = userEvent.setup();

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const editButtons = screen.getAllByLabelText(/edit message/i);
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockMessages[0]);
    });

    it('削除ボタンをクリックするとonDeleteが呼ばれる', async () => {
      const user = userEvent.setup();

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnDelete} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      const deleteButtons = screen.getAllByLabelText(/delete message/i);
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(mockMessages[0]);
    });
  });

  describe('ページネーション', () => {
    it('10件以上のデータがある場合、ページネーションが機能する', async () => {
      const user = userEvent.setup();
      const manyMessages: MessageResponse[] = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        code: `MSG${String(i + 1).padStart(3, '0')}`,
        content: `Message ${i + 1}`,
        createdAt: '2026-01-29T00:00:00Z',
        updatedAt: '2026-01-29T00:00:00Z',
      }));

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(manyMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(),
      });

      // 最初のページには10件表示
      expect(screen.getAllByText('MSG001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('MSG010').length).toBeGreaterThan(0);
      expect(screen.queryByText('MSG011')).not.toBeInTheDocument();

      // 次のページに移動
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.queryByText('MSG001')).not.toBeInTheDocument();
        expect(screen.getAllByText('MSG011').length).toBeGreaterThan(0);
        expect(screen.getAllByText('MSG015').length).toBeGreaterThan(0);
      });
    });
  });

  describe('権限制御', () => {
    it('ADMIN ロールの場合、読み取り専用メッセージが表示されない', () => {
      const adminUser: UserResponse = { username: 'admin', role: ROLES.ADMIN };

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(adminUser),
      });

      expect(screen.queryByTestId('readonly-info-message')).not.toBeInTheDocument();
    });

    it('VIEWER ロールの場合、読み取り専用メッセージが表示される', () => {
      const viewerUser: UserResponse = { username: 'viewer', role: ROLES.VIEWER };

      vi.mocked(messageApi.useGetAllMessages).mockReturnValue({
        data: createMessagePage(mockMessages),
        isLoading: false,
        error: null,
      } as any);

      render(<MessageTable onEdit={mockOnEdit} onDelete={mockOnDelete} />, {
        wrapper: createWrapper(viewerUser),
      });

      const infoMessage = screen.getByTestId('readonly-info-message');
      expect(infoMessage).toBeInTheDocument();
      expect(infoMessage).toHaveTextContent(/閲覧のみ可能です/);
    });
  });
});
