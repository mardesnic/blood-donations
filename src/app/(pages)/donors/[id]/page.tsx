import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import React from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { MdEdit } from 'react-icons/md';
import DonorService from '@/app/api/donors/service';
import { pageTitle } from '@/i18n/metadata';
import { getDisplayName } from '@/lib/utils';
import { formatDay } from '@/lib/dates';
import { BLOOD_TYPES } from '@/lib/const';
import { eligibilityLabel, eligibilityReason } from '@/lib/eligibility';
import { ROUTE_PATHS } from '@/routes';
import { DonationsProvider } from '@/context/DonationsContext';
import { DonationsHeader } from '@/app/(pages)/donations/header';
import DonationsTable from '@/app/(pages)/donations/table';
import { DonorDetailsHeader } from './header';
import { InfoField, InfoSection } from '@/components/InfoSection';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const donor = await DonorService.findOne(id);
  return {
    title: await pageTitle(
      getDisplayName([donor?.firstName || '', donor?.lastName || ''])
    ),
  };
}

// Everything about a donor on one page: when they can donate again, their
// details and their donations.
export default async function DonorOverviewPage({ params }: Props) {
  const { id } = await params;
  const overview = await DonorService.findOverview(id);
  if (!overview) {
    notFound();
  }
  const { donor, eligibility, age } = overview;
  const t = await getTranslations();
  const tEligibility = await getTranslations('eligibility');
  const donorPath = `${ROUTE_PATHS.PROTECTED.DONORS.path}/${donor.id}`;
  const canDonate = eligibility.status === 'ELIGIBLE';

  return (
    <Container component='main'>
      <DonorDetailsHeader
        donor={donor}
        badge={
          !donor.active && <Chip size='small' label={t('statuses.INACTIVE')} />
        }
      >
        <Link href={`${donorPath}/edit`}>
          <Button
            variant='outlined'
            color='inherit'
            size='medium'
            startIcon={<MdEdit />}
          >
            {t('common.edit')}
          </Button>
        </Link>
      </DonorDetailsHeader>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoSection title={t('donorOverview.donating')}>
            <InfoField
              label={t('fields.nextEligible')}
              value={
                <Typography
                  variant='h3'
                  component='span'
                  color={canDonate ? 'success.main' : 'text.primary'}
                >
                  {eligibilityLabel(eligibility, tEligibility)}
                </Typography>
              }
            />
            <InfoField
              label={t('donorOverview.why')}
              value={eligibilityReason(eligibility, tEligibility)}
            />
            <InfoField
              label={t('donorOverview.totalDonations')}
              value={donor.donationCount}
            />
            <InfoField
              label={t('fields.lastDonation')}
              value={formatDay(donor.lastDonation)}
            />
            {donor.initialDonationCount > 0 && (
              <InfoField
                label={t('donorOverview.beforeRecords')}
                value={[
                  donor.initialDonationCount,
                  formatDay(donor.initialLastDonation),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            )}
          </InfoSection>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoSection title={t('donorOverview.personal')}>
            <InfoField
              label={t('fields.bloodType')}
              value={donor.bloodType && BLOOD_TYPES[donor.bloodType]}
            />
            <InfoField
              label={t('fields.gender')}
              value={t(`genders.${donor.gender}`)}
            />
            <InfoField
              label={t('fields.dob')}
              value={
                donor.dob &&
                `${formatDay(donor.dob)}${
                  age === null ? '' : ` (${t('donorOverview.age', { age })})`
                }`
              }
            />
            <InfoField label={t('fields.oib')} value={donor.oib} />
            <InfoField
              label={t('fields.fatherName')}
              value={donor.fatherName}
            />
          </InfoSection>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoSection title={t('donorOverview.contact')}>
            <InfoField
              label={t('fields.phone')}
              value={
                donor.phone && (
                  <MuiLink href={`tel:${donor.phone}`} color='secondary'>
                    {donor.phone}
                  </MuiLink>
                )
              }
            />
            <InfoField
              label={t('fields.email')}
              value={
                donor.email && (
                  <MuiLink href={`mailto:${donor.email}`} color='secondary'>
                    {donor.email}
                  </MuiLink>
                )
              }
            />
            <InfoField label={t('fields.address')} value={donor.address} />
            <InfoField label={t('fields.city')} value={donor.city} />
          </InfoSection>
        </Grid>

        {donor.note && (
          <Grid size={12}>
            <InfoSection title={t('fields.note')}>
              <Typography sx={{ whiteSpace: 'pre-line' }}>
                {donor.note}
              </Typography>
            </InfoSection>
          </Grid>
        )}
      </Grid>

      {/* The table's "New donation" button preselects this donor. */}
      <Box id='donations' sx={{ mt: 5, scrollMarginTop: 80 }}>
        <DonationsProvider donor={donor}>
          <DonationsHeader />
          <DonationsTable />
        </DonationsProvider>
      </Box>
    </Container>
  );
}
