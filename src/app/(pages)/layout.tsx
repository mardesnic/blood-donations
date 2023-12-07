import { PageWrapper } from '@/components/PageWrapper';
import { CssBaseline } from '@mui/material';

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageWrapper>
      <CssBaseline />
      {children}
    </PageWrapper>
  );
}
