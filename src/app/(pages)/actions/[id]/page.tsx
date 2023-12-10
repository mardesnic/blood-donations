import { Metadata } from 'next';
import ActionService from '@/app/api/actions/service';
import { generatePageTitle } from '@/lib/utils';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { ROUTE_PATHS } from '@/routes';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const action = await ActionService.findOne(id);
  return {
    title: generatePageTitle(action?.title),
  };
}

export default async function ActionDetails({ params: { id } }: Props) {
  const action = await ActionService.findOne(id);
  if (!action) {
    notFound();
  }
  return (
    <>
      <Breadcrumbs>
        <Link href={ROUTE_PATHS.PROTECTED.ACTIONS.path}>Actions</Link>
        <Typography>{action.title}</Typography>
      </Breadcrumbs>
      <pre>{JSON.stringify(action, null, 2)}</pre>
    </>
  );
}
