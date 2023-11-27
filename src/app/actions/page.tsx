import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { Typography } from '@mui/material';
import { PageWrapper } from '@/components/PageWrapper';
import ActionService from '../api/actions/service';
import ActionsTable from '@/app/actions/table';

export const metadata: Metadata = {
  title: generatePageTitle('Actions'),
};

export default async function ActionsPage() {
  const actions = await ActionService.find();
  return (
    <PageWrapper>
      <Typography variant='h1'>Actions</Typography>
      <ActionsTable actions={actions} />
    </PageWrapper>
  );
}
