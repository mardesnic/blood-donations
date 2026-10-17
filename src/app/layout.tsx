import { connection } from 'next/server';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import './globals.css';
import { NextAuthSessionProvider } from './providers/NextAuthSessionProvider';
import ThemeRegistry from '@/lib/theme/ThemeRegistry';
import ReactQueryProvider from './providers/ReactQueryProvider';
import { AlertProvider } from '@/context/AlertContext';
import { pageTitle } from '@/i18n/metadata';
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: await pageTitle(t('pageTitles.welcome')),
    description: t('app.description'),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render every page per request: script nonces only exist at request time.
  await connection();
  const requested = await getLocale();
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <ThemeRegistry options={{ key: 'mui' }} locale={locale}>
            <NextAuthSessionProvider>
              <AlertProvider>
                <ReactQueryProvider>{children}</ReactQueryProvider>
              </AlertProvider>
            </NextAuthSessionProvider>
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
