import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './page';
import * as useAuthModule from '@/core/auth/useAuth';
import { createLocaleWrapper } from '../../../tests/unit/helpers/localeTestHelper';
import type { ReactNode } from 'react';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuth
vi.mock('@/core/auth/useAuth');

const createWrapper = (locale: 'ja' | 'en' = 'ja') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const LocaleWrapper = createLocaleWrapper(locale);

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleWrapper>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LocaleWrapper>
  );
  Wrapper.displayName = `TestWrapper(${locale})`;

  return Wrapper;
};

describe('LoginPage', () => {
  let mockLogin: ReturnType<typeof vi.fn<(username: string, password: string) => Promise<void>>>;

  beforeEach(() => {
    mockLogin = vi.fn<(username: string, password: string) => Promise<void>>();
    mockPush.mockClear();

    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      login: mockLogin as (username: string, password: string) => Promise<void>,
      logout: vi.fn(),
      refreshAuth: vi.fn(),
      getAccessToken: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
    });
  });

  describe('レンダリング', () => {
    it('ログインフォームが表示される', () => {
      render(<LoginPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
      expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    });

    it('開発環境用アカウント情報が表示される', () => {
      render(<LoginPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/開発環境用アカウント/)).toBeInTheDocument();
      expect(screen.getByText(/admin \/ admin123/)).toBeInTheDocument();
      expect(screen.getByText(/viewer \/ viewer123/)).toBeInTheDocument();
    });
  });

  describe('フォーム操作', () => {
    it('ユーザー名とパスワードを入力できる', async () => {
      const user = userEvent.setup();
      render(<LoginPage />, { wrapper: createWrapper() });

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('password123');
    });

    it('ログインボタンをクリックするとlogin関数が呼ばれる', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);

      render(<LoginPage />, { wrapper: createWrapper() });

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
      });
    });
  });

  describe('ログイン成功', () => {
    it('ログイン成功後、トップページにリダイレクトされる', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);

      render(<LoginPage />, { wrapper: createWrapper() });

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('ログイン失敗', () => {
    it('ログイン失敗時、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Unauthorized'));

      render(<LoginPage />, { wrapper: createWrapper() });

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(
          screen.getByText('ログインに失敗しました。ユーザー名またはパスワードが正しくありません。')
        ).toBeInTheDocument();
      });
    });

    it('英語設定時にログイン失敗エラーメッセージが英語で表示される', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Unauthorized'));

      render(<LoginPage />, { wrapper: createWrapper('en') });

      await user.type(screen.getByTestId('login-username-input'), 'admin');
      await user.type(screen.getByTestId('login-password-input'), 'wrongpassword');
      await user.click(screen.getByTestId('login-submit-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Login failed');
      });
    });

    it('日本語設定時にログイン失敗エラーメッセージが日本語で表示される', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Unauthorized'));

      render(<LoginPage />, { wrapper: createWrapper() });

      await user.type(screen.getByTestId('login-username-input'), 'admin');
      await user.type(screen.getByTestId('login-password-input'), 'wrongpassword');
      await user.click(screen.getByTestId('login-submit-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('ログインに失敗しました');
      });
    });

    it('ログイン失敗後、再度ログインできる', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Unauthorized')).mockResolvedValueOnce(undefined);

      render(<LoginPage />, { wrapper: createWrapper() });

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // First attempt (failure)
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/ログインに失敗しました/)).toBeInTheDocument();
      });

      // Second attempt (success)
      await user.clear(usernameInput);
      await user.clear(passwordInput);
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('送信中の状態', () => {
    it('送信中はボタンが無効化される', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginPage />, { wrapper: createWrapper() });

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(loginButton);

      expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled();

      // Wait for the pending submit to settle so its state update doesn't run after teardown
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('送信中は入力フィールドが無効化される', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginPage />, { wrapper: createWrapper() });

      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(loginButton);

      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();

      // Wait for the pending submit to settle so its state update doesn't run after teardown
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });
});
