import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Box, Grid, Link as MuiLink, Typography } from '@mui/material';
import PlaceService from '@/app/api/places/service';
import { pageTitle } from '@/i18n/metadata';
import { ROUTE_PATHS } from '@/routes';
import { InfoField, InfoSection } from '@/components/InfoSection';
import { ActionTimes } from '@/components/ActionTimes';
import { PlacesProvider } from '@/context/PlacesContext';
import { ActionsProvider } from '@/context/ActionsContext';
import { ActionsHeader } from '@/app/(pages)/actions/header';
import ActionsTable from '@/app/(pages)/actions/table';
import { ActionCreateDialog } from '@/app/(pages)/actions/dialogs/create';
import { ActionUpdateDialog } from '@/app/(pages)/actions/dialogs/update';
import { ActionDeleteDialog } from '@/app/(pages)/actions/dialogs/delete';
import { PlaceCreateUpdateDialog } from '../dialogs/createUpdate';
import { PlaceDeleteDialog } from '../dialogs/delete';
import { PlaceDetailsHeader } from './header';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const place = await PlaceService.findOne(id);
  return { title: await pageTitle(place?.title) };
}

type ActionLink = {
  id: string;
  title: string;
  startDateTime: Date;
  endDateTime: Date;
} | null;

// An action's title (linked) and when it is.
const ActionSummary = ({ action }: { action: ActionLink }) =>
  action && (
    <>
      <Link
        href={`${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${action.id}`}
        style={{ textDecoration: 'underline' }}
      >
        {action.title}
      </Link>
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
        }}
      >
        <ActionTimes start={action.startDateTime} end={action.endDateTime} />
      </Typography>
    </>
  );

// A place at a glance: where it is, who to contact, its actions.
export default async function PlaceDetailsPage({ params }: Props) {
  const { id } = await params;
  const overview = await PlaceService.findOverview(id);
  if (!overview) {
    notFound();
  }
  const { place, donationCount, nextAction, lastAction } = overview;
  const t = await getTranslations();
  const address = [place.address, place.city].filter(Boolean).join(', ');

  return (
    <>
      <PlacesProvider>
        <PlaceDetailsHeader place={place} />
        <PlaceCreateUpdateDialog />
        <PlaceDeleteDialog />
      </PlacesProvider>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoSection title={t('placeOverview.location')}>
            <InfoField
              label={t('fields.address')}
              value={
                address && (
                  <>
                    {address}
                    <br />
                    <MuiLink
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      color='secondary'
                      variant='body2'
                    >
                      {t('placeOverview.showOnMap')}
                    </MuiLink>
                  </>
                )
              }
            />
            {place.note && (
              <InfoField
                label={t('fields.note')}
                value={
                  <Typography sx={{ whiteSpace: 'pre-line' }}>
                    {place.note}
                  </Typography>
                }
              />
            )}
          </InfoSection>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoSection title={t('placeOverview.contact')}>
            <InfoField
              label={t('fields.contactName')}
              value={place.contactName}
            />
            <InfoField
              label={t('fields.phone')}
              value={
                place.phone && (
                  <MuiLink href={`tel:${place.phone}`} color='secondary'>
                    {place.phone}
                  </MuiLink>
                )
              }
            />
            <InfoField
              label={t('fields.email')}
              value={
                place.email && (
                  <MuiLink href={`mailto:${place.email}`} color='secondary'>
                    {place.email}
                  </MuiLink>
                )
              }
            />
          </InfoSection>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoSection title={t('placeOverview.actions')}>
            <InfoField
              label={t('placeOverview.actionCount')}
              value={place._count.actions}
            />
            <InfoField
              label={t('placeOverview.donationCount')}
              value={donationCount}
            />
            <InfoField
              label={t('placeOverview.nextAction')}
              value={nextAction && <ActionSummary action={nextAction} />}
            />
            <InfoField
              label={t('placeOverview.lastAction')}
              value={lastAction && <ActionSummary action={lastAction} />}
            />
          </InfoSection>
        </Grid>
      </Grid>

      {/* New actions created here get this place. */}
      <Box sx={{ mt: 5 }}>
        <ActionsProvider place={place}>
          <ActionsHeader />
          <ActionsTable />
          <ActionCreateDialog />
          <ActionUpdateDialog />
          <ActionDeleteDialog />
        </ActionsProvider>
      </Box>
    </>
  );
}
