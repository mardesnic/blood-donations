import { Metadata } from 'next';
import Link from 'next/link';
import { generatePageTitle } from '@/lib/utils';
import { Stack, Typography } from '@mui/material';
import { PageWrapper } from '@/components/PageWrapper';
import ActionsTable from '@/app/actions/table';
import { ActionsProvider } from '@/context/ActionsContext';
import Button from '@mui/material/Button';

export const metadata: Metadata = {
  title: generatePageTitle('Actions'),
};

export default async function ActionsPage() {
  return (
    <PageWrapper>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={2}
      >
        <Typography variant='h1'>Actions</Typography>
        <Link href='/actions/new'>
          <Button>Create new</Button>
        </Link>
      </Stack>
      <ActionsProvider>
        <ActionsTable />
      </ActionsProvider>
    </PageWrapper>
  );
}
