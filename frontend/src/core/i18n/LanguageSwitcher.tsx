'use client';

import { Button } from '@/core/components/ui/button';
import { useLocale } from '@/core/i18n/LocaleContext';
import { cn } from '@/core/lib/utils';

export interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  const handleClick = () => {
    setLocale(locale === 'ja' ? 'en' : 'ja');
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      data-testid="language-switcher"
      className={cn(className)}
      aria-label={locale === 'ja' ? 'Switch to English' : '日本語に切り替え'}
    >
      {locale === 'ja' ? '🌐 日本語' : '🌐 English'}
    </Button>
  );
}
