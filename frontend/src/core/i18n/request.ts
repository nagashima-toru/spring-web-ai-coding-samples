import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Server-side default locale (client-side locale switching is handled by LocaleContext)
  const locale = 'ja';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
