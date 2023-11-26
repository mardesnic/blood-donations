import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { NextAuthSessionProvider } from './providers/sessionProvider';
import { APP_DESCRIPTION } from '@/lib/const';
import { generatePageTitle } from '@/lib/utils';
import ThemeRegistry from '@/lib/theme/ThemeRegistry';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

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
      <body className={roboto.className}>
        <ThemeRegistry options={{ key: 'mui' }}>
          <NextAuthSessionProvider>
            <Container>
              <CssBaseline />
              {children}
            </Container>
          </NextAuthSessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
