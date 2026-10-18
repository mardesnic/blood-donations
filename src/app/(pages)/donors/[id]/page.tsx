import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import React, { ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Stack,
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

// A label and its value; empty values show a dash.
const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <Box>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    <Typography component='div' sx={{ wordBreak: 'break-word' }}>
      {value || value === 0 ? value : '—'}
    </Typography>
  </Box>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant='h3' component='h2' sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Stack gap={1.5}>{children}</Stack>
    </CardContent>
  </Card>
);

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
          <Section title={t('donorOverview.donating')}>
            <Field
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
            <Field
              label={t('donorOverview.why')}
              value={eligibilityReason(eligibility, tEligibility)}
            />
            <Field
              label={t('donorOverview.totalDonations')}
              value={donor.donationCount}
            />
            <Field
              label={t('fields.lastDonation')}
              value={formatDay(donor.lastDonation)}
            />
            {donor.initialDonationCount > 0 && (
              <Field
                label={t('donorOverview.beforeRecords')}
                value={[
                  donor.initialDonationCount,
                  formatDay(donor.initialLastDonation),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            )}
          </Section>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Section title={t('donorOverview.personal')}>
            <Field
              label={t('fields.bloodType')}
              value={donor.bloodType && BLOOD_TYPES[donor.bloodType]}
            />
            <Field
              label={t('fields.gender')}
              value={t(`genders.${donor.gender}`)}
            />
            <Field
              label={t('fields.dob')}
              value={
                donor.dob &&
                `${formatDay(donor.dob)}${
                  age === null ? '' : ` (${t('donorOverview.age', { age })})`
                }`
              }
            />
            <Field label={t('fields.oib')} value={donor.oib} />
            <Field label={t('fields.fatherName')} value={donor.fatherName} />
          </Section>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Section title={t('donorOverview.contact')}>
            <Field
              label={t('fields.phone')}
              value={
                donor.phone && (
                  <MuiLink href={`tel:${donor.phone}`} color='secondary'>
                    {donor.phone}
                  </MuiLink>
                )
              }
            />
            <Field
              label={t('fields.email')}
              value={
                donor.email && (
                  <MuiLink href={`mailto:${donor.email}`} color='secondary'>
                    {donor.email}
                  </MuiLink>
                )
              }
            />
            <Field label={t('fields.address')} value={donor.address} />
            <Field label={t('fields.city')} value={donor.city} />
          </Section>
        </Grid>

        {donor.note && (
          <Grid size={12}>
            <Section title={t('fields.note')}>
              <Typography sx={{ whiteSpace: 'pre-line' }}>
                {donor.note}
              </Typography>
            </Section>
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
