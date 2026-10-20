'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { MdEmail, MdPhone } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { BloodType } from '@/generated/prisma/browser';
import { BLOOD_TYPES, MAX_PAGE_SIZE } from '@/lib/const';
import { formatDay } from '@/lib/dates';
import { getDisplayName } from '@/lib/utils';
import {
  CallListQuery,
  callListToSearchParams,
  ContactType,
  contactSummary,
  HIDE_CONTACTED_DAYS,
  parseCallListQuery,
} from '@/lib/callList';
import {
  CallListDonor,
  Contact,
  useCallList,
  useDeleteContact,
  useLogContact,
} from '@/hooks/useContacts';
import { useAlertContext } from '@/context/AlertContext';
import { ContactDialog } from '@/components/ContactDialog';
import { ROUTE_PATHS } from '@/routes';

// "Show more" adds this many; the API returns at most MAX_PAGE_SIZE.
const STEP = 25;

// Who can donate now, to call or e-mail. Logged contacts stay on screen
// (with Undo) until the filters change; the list is always read from the
// start, so hiding contacted donors never skips anyone.
export const CallList = () => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const query = parseCallListQuery(searchParams);
  const [shown, setShown] = React.useState(STEP);
  // Contacts logged here, by donor, so their rows can show them and undo.
  const [logged, setLogged] = React.useState<Record<string, Contact>>({});
  const [dialogDonor, setDialogDonor] = React.useState<CallListDonor | null>(
    null
  );

  const filterString = callListToSearchParams(query).toString();
  const params = new URLSearchParams(filterString);
  params.set('pageSize', String(shown));
  const { data, isLoading, isError, isFetching } = useCallList(
    params.toString()
  );

  const setQuery = (changes: Partial<CallListQuery>) => {
    const next = callListToSearchParams({ ...query, ...changes }).toString();
    window.history.replaceState(null, '', next ? `?${next}` : '?');
    setShown(STEP);
    setLogged({});
  };

  const { showAlert } = useAlertContext();
  const logContact = useLogContact();
  const deleteContact = useDeleteContact();

  const save = (type: ContactType, note: string) => {
    if (!dialogDonor) {
      return;
    }
    const donorId = dialogDonor.id;
    logContact.mutate(
      { donorId, type, note },
      {
        onSuccess: (contact) => {
          setLogged((previous) => ({ ...previous, [donorId]: contact }));
          setDialogDonor(null);
          showAlert(t('contacts.saved'), 'success');
        },
        onError: () => showAlert(t('contacts.saveError'), 'error'),
      }
    );
  };

  const undo = (donorId: string) => {
    const contact = logged[donorId];
    if (!contact) {
      return;
    }
    deleteContact.mutate(contact.id, {
      onSuccess: () => {
        setLogged(({ [donorId]: _, ...rest }) => rest);
        showAlert(t('contacts.deleted'), 'success');
      },
      onError: () => showAlert(t('contacts.deleteError'), 'error'),
    });
  };

  const donors = data?.donors || [];
  const count = data?.count || 0;

  return (
    <>
      <Grid container columnSpacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            label={t('callList.bloodTypes')}
            value={query.bloodTypes}
            onChange={(event) => {
              const value = event.target.value as unknown as
                | BloodType[]
                | string;
              setQuery({
                bloodTypes: (typeof value === 'string'
                  ? value.split(',')
                  : value) as BloodType[],
              });
            }}
            slotProps={{
              // Labels stay up, so empty fields read "any", like the city.
              inputLabel: { shrink: true },
              select: {
                multiple: true,
                displayEmpty: true,
                renderValue: (selected) =>
                  (selected as BloodType[]).length ? (
                    (selected as BloodType[])
                      .map((bloodType) => BLOOD_TYPES[bloodType])
                      .join(', ')
                  ) : (
                    <Box component='span' sx={{ color: 'text.disabled' }}>
                      {t('callList.anyBloodType')}
                    </Box>
                  ),
              },
            }}
          >
            {Object.keys(BLOOD_TYPES).map((bloodType) => (
              <MenuItem key={bloodType} value={bloodType}>
                {BLOOD_TYPES[bloodType]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Autocomplete
            freeSolo
            options={data?.cities || []}
            value={query.city}
            onChange={(_, value) => setQuery({ city: value || '' })}
            onBlur={(event) => {
              const typed = (event.target as HTMLInputElement).value.trim();
              if (typed !== query.city) {
                setQuery({ city: typed });
              }
            }}
            renderInput={(inputParams) => (
              <TextField
                {...inputParams}
                label={t('fields.city')}
                placeholder={t('callList.anyCity')}
                slotProps={{
                  inputLabel: { ...inputParams.InputLabelProps, shrink: true },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            label={t('callList.hideContacted')}
            value={query.hideContactedDays}
            onChange={(event) =>
              setQuery({ hideContactedDays: Number(event.target.value) })
            }
          >
            {HIDE_CONTACTED_DAYS.map((days) => (
              <MenuItem key={days} value={days}>
                {t('callList.hideOption', { days })}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Stack direction='row' alignItems='center' gap={1} sx={{ mb: 2 }}>
        <Typography color='text.secondary'>
          {data ? t('callList.count', { count }) : ''}
        </Typography>
        {isFetching && <CircularProgress size={16} />}
      </Stack>

      {isLoading && <CircularProgress />}
      {isError && (
        <Typography color='error.main'>{t('callList.loadError')}</Typography>
      )}
      {data && !donors.length && (
        <Typography color='text.secondary'>{t('callList.empty')}</Typography>
      )}

      <Stack gap={2}>
        {donors.map((donor) => (
          <CallListRow
            key={donor.id}
            donor={donor}
            loggedContact={logged[donor.id]}
            onLog={() => setDialogDonor(donor)}
            onUndo={() => undo(donor.id)}
            undoing={deleteContact.isPending}
          />
        ))}
      </Stack>

      {donors.length < count && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          {shown < MAX_PAGE_SIZE ? (
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => setShown(Math.min(shown + STEP, MAX_PAGE_SIZE))}
              disabled={isFetching}
            >
              {t('callList.showMore')}
            </Button>
          ) : (
            <Typography color='text.secondary'>
              {t('callList.narrowDown', { shown: donors.length })}
            </Typography>
          )}
        </Box>
      )}

      {dialogDonor && (
        <ContactDialog
          open
          donorName={getDisplayName([
            dialogDonor.firstName,
            dialogDonor.lastName,
          ])}
          defaultType={dialogDonor.phone ? 'CALL' : 'EMAIL'}
          saving={logContact.isPending}
          onClose={() => setDialogDonor(null)}
          onSave={save}
        />
      )}
    </>
  );
};

const CallListRow = ({
  donor,
  loggedContact,
  onLog,
  onUndo,
  undoing,
}: {
  donor: CallListDonor;
  loggedContact: Contact | undefined;
  onLog: () => void;
  onUndo: () => void;
  undoing: boolean;
}) => {
  const t = useTranslations();
  const lastContact = loggedContact || donor.lastContact;
  const details = [
    donor.city,
    donor.lastDonation
      ? `${t('fields.lastDonation')}: ${formatDay(donor.lastDonation)}`
      : t('callList.neverDonated'),
    donor.donationCount
      ? t('callList.donations', { count: donor.donationCount })
      : null,
  ].filter(Boolean);

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent='space-between'
          gap={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction='row' alignItems='center' gap={1}>
              <Link
                href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${donor.id}`}
                style={{ textDecoration: 'underline' }}
                className='tap-target'
              >
                <Typography variant='h3' component='span'>
                  {getDisplayName([donor.firstName, donor.lastName])}
                </Typography>
              </Link>
              {donor.bloodType && (
                <Chip size='small' label={BLOOD_TYPES[donor.bloodType]} />
              )}
            </Stack>
            <Typography variant='body2' color='text.secondary'>
              {details.join(' · ')}
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              columnGap={3}
              sx={{ mt: 1 }}
            >
              {donor.phone && (
                <MuiLink
                  href={`tel:${donor.phone}`}
                  color='secondary'
                  className='tap-target'
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                >
                  <MdPhone /> {donor.phone}
                </MuiLink>
              )}
              {donor.email && (
                <MuiLink
                  href={`mailto:${donor.email}`}
                  color='secondary'
                  className='tap-target'
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  <MdEmail /> {donor.email}
                </MuiLink>
              )}
            </Stack>
          </Box>
          <Stack
            alignItems={{ xs: 'stretch', md: 'flex-end' }}
            gap={1}
            sx={{ flexShrink: 0 }}
          >
            <Typography
              variant='body2'
              color={loggedContact ? 'success.main' : 'text.secondary'}
            >
              {t('callList.lastContact')}:{' '}
              {lastContact
                ? contactSummary(lastContact, t)
                : t('callList.neverContacted')}
            </Typography>
            {lastContact?.note && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ maxWidth: { md: 280 }, whiteSpace: 'pre-line' }}
              >
                {lastContact.note}
              </Typography>
            )}
            {loggedContact ? (
              <Button
                variant='outlined'
                color='inherit'
                onClick={onUndo}
                disabled={undoing}
              >
                {t('contacts.undo')}
              </Button>
            ) : (
              <Button color='secondary' onClick={onLog}>
                {t('contacts.log')}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
