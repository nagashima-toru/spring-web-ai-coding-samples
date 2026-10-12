'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/core/i18n/LanguageSwitcher';
import { useAuth } from '@/core/auth/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const t = useTranslations('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setError(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="login-page"
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12"
    >
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {t('username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              disabled={isSubmitting}
              autoComplete="username"
              data-testid="login-username-input"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              autoComplete="current-password"
              data-testid="login-password-input"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            data-testid="login-submit-button"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{t('devAccounts')}</p>
          <p className="mt-1">
            <strong>{t('adminLabel')}:</strong> admin / admin123
          </p>
          <p>
            <strong>{t('viewerLabel')}:</strong> viewer / viewer123
          </p>
        </div>
      </div>
    </div>
  );
}
