import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Breadcrumbs, Chip, Stack, Typography } from '@mui/material';
import { DonationWithDonor } from '@/context/DonationsContext';
import { BLOOD_TYPES } from '@/lib/const';
import { formatDay, toAppDay } from '@/lib/dates';
import { ROUTE_PATHS } from '@/routes';

interface Props {
  donation: DonationWithDonor;
}

// Breadcrumbs like the other detail pages, then the donor and the action
// with links to their pages.
export const UpdateDonationHeader = async ({ donation }: Props) => {
  const t = await getTranslations();
  const { donor, action } = donation;
  return (
    <>
      <Breadcrumbs>
        <Link
          href={ROUTE_PATHS.PROTECTED.DONATIONS.path}
          className='tap-target'
        >
          {t('nav.donations')}
        </Link>
        {/* Breadcrumbs grey the last item; the title stays prominent. */}
        <Typography
          variant='h1'
          sx={{
            color: 'text.primary',
            mb: 0,
          }}
        >
          {donor.fullName} · {formatDay(toAppDay(donation.donationDate))}
        </Typography>
      </Breadcrumbs>
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 1,
          rowGap: 0.5,
          mt: 1,
          color: 'text.secondary',
        }}
      >
        <Link
          href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${donor.id}`}
          style={{ textDecoration: 'underline' }}
          className='tap-target'
        >
          {donor.fullName}
        </Link>
        {donor.bloodType && (
          <Chip size='small' label={BLOOD_TYPES[donor.bloodType]} />
        )}
        <span>·</span>
        {action ? (
          <Link
            href={`${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${action.id}`}
            style={{ textDecoration: 'underline' }}
            className='tap-target'
          >
            {action.title}
          </Link>
        ) : (
          <span>{t('donations.noAction')}</span>
        )}
        {donation.denied && (
          <Chip
            size='small'
            color='error'
            variant='outlined'
            label={t('donations.denied')}
          />
        )}
      </Stack>
    </>
  );
};
