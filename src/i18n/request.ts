import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, resolveLocale } from './config';

// The language comes from a cookie (or the browser), not from the URL.
export default getRequestConfig(async () => {
  const locale = resolveLocale(
    (await cookies()).get(LOCALE_COOKIE)?.value,
    (await headers()).get('accept-language')
  );
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Europe/Zagreb',
  };
});
