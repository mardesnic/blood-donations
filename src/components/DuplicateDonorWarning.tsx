'use client';

import React from 'react';
import Link from 'next/link';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { formatDay } from '@/lib/dates';
import { DuplicateMatch } from '@/hooks/useDuplicateDonors';
import { ROUTE_PATHS } from '@/routes';

interface Props {
  matches: DuplicateMatch[];
  confirmedDifferent: boolean;
  onConfirmDifferent: (value: boolean) => void;
  // Offered in drive mode: use the existing donor instead.
  onPick?: (match: DuplicateMatch) => void;
}

// Existing donors who may be the same person: the same OIB (blocks saving),
// the same name and date of birth (needs confirming), or just the same name.
export const DuplicateDonorWarning = ({
  matches,
  confirmedDifferent,
  onConfirmDifferent,
  onPick,
}: Props) => {
  const t = useTranslations('duplicates');
  if (!matches.length) {
    return null;
  }
  const strongest = matches[0].reason;
  const shown = matches.filter((m) => m.reason === strongest);
  const severity =
    strongest === 'oib'
      ? 'error'
      : strongest === 'nameDob'
        ? 'warning'
        : 'info';
  return (
    <Alert severity={severity} sx={{ mt: 2 }}>
      <Typography variant='body2' sx={{ fontWeight: 700, mb: 1 }}>
        {t(strongest)}
      </Typography>
      <Stack gap={1}>
        {shown.map((match) => (
          <Stack
            key={match.donor.id}
            direction='row'
            alignItems='center'
            gap={1}
            flexWrap='wrap'
          >
            <Link
              href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${match.donor.id}`}
              target='_blank'
              style={{ textDecoration: 'underline' }}
            >
              {match.donor.fullName}
            </Link>
            <Typography variant='body2' color='text.secondary'>
              {[match.donor.oib, formatDay(match.donor.dob), match.donor.city]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
            {onPick && (
              <Button
                size='small'
                variant='outlined'
                color='inherit'
                onClick={() => onPick(match)}
              >
                {t('pick')}
              </Button>
            )}
          </Stack>
        ))}
      </Stack>
      {strongest === 'nameDob' && (
        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Checkbox
              checked={confirmedDifferent}
              onChange={(event) => onConfirmDifferent(event.target.checked)}
            />
          }
          label={t('confirmDifferent')}
        />
      )}
    </Alert>
  );
};
