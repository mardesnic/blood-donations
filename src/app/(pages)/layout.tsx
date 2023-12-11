import { PageWrapper } from '@/components/PageWrapper';
import { CssBaseline } from '@mui/material';
import { AlertPopup } from '@/components/AlertPopup';

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageWrapper>
      <AlertPopup />
      <CssBaseline />
      {children}
    </PageWrapper>
  );
}
