import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LocaleContext } from '@/core/i18n/LocaleContext';
import enMessages from '../../../messages/en.json';
import jaMessages from '../../../messages/ja.json';
import { LanguageSwitcher } from './LanguageSwitcher';

const meta = {
  title: 'Common/LanguageSwitcher',
  component: LanguageSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 日本語設定時（ボタンラベルが「🌐 日本語」）
 */
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
      <LanguageSwitcher />
    </LocaleContext.Provider>
  ),
};

/**
 * 英語設定時（ボタンラベルが「🌐 English」）
 */
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
      <LanguageSwitcher />
    </LocaleContext.Provider>
  ),
};
