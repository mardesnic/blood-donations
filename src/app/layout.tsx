import type { Metadata } from 'next';
import './globals.css';
import { NextAuthSessionProvider } from './providers/NextAuthSessionProvider';
import { APP_DESCRIPTION } from '@/lib/const';
import { generatePageTitle } from '@/lib/utils';
import ThemeRegistry from '@/lib/theme/ThemeRegistry';
import CssBaseline from '@mui/material/CssBaseline';
import ReactQueryProvider from './providers/ReactQueryProvider';

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
      <body>
        <ThemeRegistry options={{ key: 'mui' }}>
          <NextAuthSessionProvider>
            <ReactQueryProvider>
              <CssBaseline />
              {children}
            </ReactQueryProvider>
          </NextAuthSessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
