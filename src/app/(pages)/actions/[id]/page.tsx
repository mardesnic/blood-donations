import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Box, Grid, Link as MuiLink, Typography } from '@mui/material';
import ActionService from '@/app/api/actions/service';
import { pageTitle } from '@/i18n/metadata';
import { BLOOD_TYPES } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import { InfoField, InfoSection } from '@/components/InfoSection';
import { ActionsProvider } from '@/context/ActionsContext';
import { DonationsProvider } from '@/context/DonationsContext';
import { DonationsHeader } from '@/app/(pages)/donations/header';
import DonationsTable from '@/app/(pages)/donations/table';
import { DonationDeleteDialog } from '@/app/(pages)/donations/dialogs/delete';
import { ActionUpdateDialog } from '@/app/(pages)/actions/dialogs/update';
import { ActionDeleteDialog } from '@/app/(pages)/actions/dialogs/delete';
import { ActionDetailsHeader } from './header';
import { ActionTimes } from '@/components/ActionTimes';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const action = await ActionService.findOne(id);
  return {
    title: await pageTitle(action?.title),
  };
}

// An action at a glance: when and where, how it went, and its donations.
export default async function ActionDetails({ params }: Props) {
  const { id } = await params;
  const overview = await ActionService.findOverview(id);
  if (!overview) {
    notFound();
  }
  const { action, summary } = overview;
  const { place } = action;
  const t = await getTranslations();
  const counts = <T,>(
    items: { count: number; item: T }[],
    name: (item: T) => string
  ) => items.map(({ item, count }) => `${name(item)} ×${count}`).join(' · ');

  return (
    <>
      <ActionsProvider>
        <ActionDetailsHeader action={action} />
        <ActionUpdateDialog />
        <ActionDeleteDialog />
      </ActionsProvider>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoSection title={t('actionOverview.details')}>
            <InfoField
              label={t('actionOverview.time')}
              value={
                <ActionTimes
                  start={action.startDateTime}
                  end={action.endDateTime}
                />
              }
            />
            <InfoField
              label={t('fields.place')}
              value={
                place && (
                  // A server page can't pass Next's Link to MUI's Link, so
                  // this is Next's Link, underlined like the other links.
                  <Link
                    href={`${ROUTE_PATHS.PROTECTED.PLACES.path}/${place.id}`}
                    style={{ textDecoration: 'underline' }}
                  >
                    {place.title}
                  </Link>
                )
              }
            />
            {place && (
              <InfoField
                label={t('fields.address')}
                value={[place.address, place.city].filter(Boolean).join(', ')}
              />
            )}
            {place?.contactName || place?.phone ? (
              <InfoField
                label={t('fields.contactName')}
                value={
                  <>
                    {place.contactName}
                    {place.contactName && place.phone && ' · '}
                    {place.phone && (
                      <MuiLink href={`tel:${place.phone}`} color='secondary'>
                        {place.phone}
                      </MuiLink>
                    )}
                  </>
                }
              />
            ) : null}
            {action.note && (
              <InfoField
                label={t('fields.note')}
                value={
                  <Typography sx={{ whiteSpace: 'pre-line' }}>
                    {action.note}
                  </Typography>
                }
              />
            )}
          </InfoSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <InfoSection title={t('actionOverview.result')}>
            {summary.successful + summary.denied === 0 ? (
              <Typography color='text.secondary'>
                {t('actionOverview.noDonations')}
              </Typography>
            ) : (
              <>
                <InfoField
                  label={t('actionOverview.successful')}
                  value={
                    <Typography variant='h3' component='span'>
                      {summary.successful}
                    </Typography>
                  }
                />
                <InfoField
                  label={t('actionOverview.denied')}
                  value={summary.denied}
                />
                {summary.denied > 0 && (
                  <InfoField
                    label={t('actionOverview.deniedReasons')}
                    value={counts(
                      summary.denyReasons.map(({ reason, count }) => ({
                        item: reason,
                        count,
                      })),
                      (reason) =>
                        reason
                          ? t(`denyReasons.${reason}`)
                          : t('common.unknown')
                    )}
                  />
                )}
                {summary.successful > 0 && (
                  <InfoField
                    label={t('actionOverview.bloodTypes')}
                    value={counts(
                      summary.bloodTypes.map(({ bloodType, count }) => ({
                        item: bloodType,
                        count,
                      })),
                      (bloodType) =>
                        bloodType
                          ? BLOOD_TYPES[bloodType] || bloodType
                          : t('common.unknown')
                    )}
                  />
                )}
              </>
            )}
          </InfoSection>
        </Grid>
      </Grid>

      {/* "New donation" preselects this action. */}
      <Box sx={{ mt: 5 }}>
        <DonationsProvider action={action}>
          <DonationsHeader />
          <DonationsTable />
          <DonationDeleteDialog />
        </DonationsProvider>
      </Box>
    </>
  );
}
