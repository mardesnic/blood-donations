import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthSessionProvider } from './providers/sessionProvider';
import { APP_DESCRIPTION } from '@/lib/const';
import { generatePageTitle } from '@/lib/utils';
import { PageWrapper } from '@/components/layout/PageWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: generatePageTitle('Welcome'),
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <PageWrapper>{children}</PageWrapper>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
