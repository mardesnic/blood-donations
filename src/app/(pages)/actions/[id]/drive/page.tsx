import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Breadcrumbs, Container, Typography } from '@mui/material';
import ActionService from '@/app/api/actions/service';
import { pageTitle } from '@/i18n/metadata';
import { ROUTE_PATHS } from '@/routes';
import { ActionTimes } from '@/components/ActionTimes';
import { DriveMode } from './driveMode';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const action = await ActionService.findOne(id);
  const t = await getTranslations('drive');
  return { title: await pageTitle(`${t('title')} - ${action?.title || ''}`) };
}

// Quick entry of donations during (or right after) a blood drive.
export default async function DriveModePage({ params }: Props) {
  const { id } = await params;
  const action = await ActionService.findOne(id);
  if (!action) {
    notFound();
  }
  const t = await getTranslations();
  const actionPath = `${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${action.id}`;
  return (
    <Container maxWidth='md' disableGutters>
      <Breadcrumbs>
        <Link href={ROUTE_PATHS.PROTECTED.ACTIONS.path} className='tap-target'>
          {t('nav.actions')}
        </Link>
        <Link href={actionPath} className='tap-target'>
          {action.title}
        </Link>
        <Typography color='text.primary'>{t('drive.title')}</Typography>
      </Breadcrumbs>
      <Typography variant='h1' sx={{ mt: 2, mb: 0.5 }}>
        {action.title}
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        <ActionTimes start={action.startDateTime} end={action.endDateTime} />
        {action.place ? ` · ${action.place.title}` : ''}
        {' · '}
        {/* The expected donors' sheet, to tick off on paper. */}
        <Link
          href={`${actionPath}/print?sheet=expected`}
          style={{ textDecoration: 'underline' }}
          className='tap-target'
        >
          {t('driveSheets.expected')}
        </Link>
      </Typography>
      <DriveMode
        action={{
          id: action.id,
          title: action.title,
          startDateTime: action.startDateTime.toISOString(),
          endDateTime: action.endDateTime.toISOString(),
        }}
      />
    </Container>
  );
}
