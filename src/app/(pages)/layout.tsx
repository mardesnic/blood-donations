import { PageWrapper } from '@/components/PageWrapper';

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper>{children}</PageWrapper>;
}
