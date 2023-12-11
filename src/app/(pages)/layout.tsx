import { PageWrapper } from '@/components/PageWrapper';
import { AlertPopup } from '@/components/AlertPopup';

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageWrapper>
      <AlertPopup />
      {children}
    </PageWrapper>
  );
}
