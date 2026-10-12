import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import { LocaleContext } from '@/core/i18n/LocaleContext';
import jaMessages from '../../../messages/ja.json';
import enMessages from '../../../messages/en.json';
import LoginPage from './page';

const meta = {
  title: 'Pages/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (_args) => (
    <LocaleContext.Provider
      value={{
        locale: 'ja',
        setLocale: () => {},
        messages: jaMessages as Record<string, unknown>,
      }}
    >
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <LoginPage />
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ログインページのデフォルト表示（日本語）。開発環境用の認証情報が表示されています。',
      },
    },
  },
};

export const English: Story = {
  args: {},
  render: (_args) => (
    <LocaleContext.Provider
      value={{
        locale: 'en',
        setLocale: () => {},
        messages: enMessages as Record<string, unknown>,
      }}
    >
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <LoginPage />
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Login page in English.',
      },
    },
  },
};
