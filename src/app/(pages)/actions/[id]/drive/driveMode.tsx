'use client';

import React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { MdAdd, MdCheck, MdClose, MdUndo } from 'react-icons/md';
import { GoDotFill } from 'react-icons/go';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { DenyReasonType } from '@/generated/prisma/browser';
import { BLOOD_TYPES, DATE_TIME_FORMAT, reactQueryKeys } from '@/lib/const';
import { eligibilityLabel, eligibilityReason } from '@/lib/eligibility';
import { defaultDonationTime } from '@/lib/drive';
import { DonorListItem, useGetDonors } from '@/hooks/useDonors';
import { useGetDonations } from '@/hooks/useDonations';
import { useAlertContext } from '@/context/AlertContext';
import { QuickDonorDialog } from './quickDonor';

export interface DriveAction {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
}

const DENY_REASONS = Object.keys(DenyReasonType);

// Records donations at a blood drive one after another: find the donor,
// tap the outcome, and the form is ready for the next one.
export const DriveMode = ({ action }: { action: DriveAction }) => {
  const t = useTranslations();
  const tEligibility = useTranslations('eligibility');
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();
  const searchRef = React.useRef<HTMLInputElement>(null);

  const [input, setInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [donor, setDonor] = React.useState<DonorListItem | null>(null);
  const [showReasons, setShowReasons] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [time, setTime] = React.useState<Dayjs | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [quickAdd, setQuickAdd] = React.useState(false);
  const [confirmUndo, setConfirmUndo] = React.useState<string | null>(null);

  // Set in the browser: a server-side "now" wouldn't match after hydration.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(
      dayjs(
        defaultDonationTime(
          new Date(),
          action.startDateTime,
          action.endDateTime
        )
      )
    );
  }, [action.startDateTime, action.endDateTime]);

  // Search once typing pauses.
  React.useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const countsKey = ['ACTION_COUNTS', action.id];
  const { data: counts } = useQuery({
    queryKey: countsKey,
    queryFn: async () =>
      (await fetch(`/api/actions/${action.id}/summary`).then((r) =>
        r.json()
      )) as { successful: number; denied: number },
  });
  const { data: recentData } = useGetDonations(
    { page: 0, pageSize: 100, sort: 'createdAt|desc' },
    undefined,
    action.id
  );
  const recent = recentData?.donations || [];
  const recorded = new Set(recent.map((d) => d.donorId));
  const searching = search.length >= 2 && !donor;
  const { data: found, isFetching: isSearching } = useGetDonors(
    { page: 0, pageSize: 10, search, sort: 'fullName|asc' },
    searching
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: countsKey });
    queryClient.invalidateQueries({ queryKey: reactQueryKeys.donations.all() });
    queryClient.invalidateQueries({ queryKey: reactQueryKeys.donors.all() });
  };

  const nextDonor = () => {
    setDonor(null);
    setInput('');
    setSearch('');
    setNote('');
    setShowReasons(false);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const save = async (denyReason: string | null) => {
    if (!donor || !time?.isValid()) {
      return;
    }
    setSaving(true);
    const response = await fetch('/api/donations', {
      method: 'POST',
      body: JSON.stringify({
        donorId: donor.id,
        actionId: action.id,
        denied: !!denyReason,
        denyReason,
        donationDate: time.toDate(),
        note,
      }),
    }).catch(() => null);
    setSaving(false);
    if (!response?.ok) {
      showAlert(t('drive.saveError'), 'error');
      return;
    }
    const name = donor.fullName || '';
    showAlert(
      denyReason
        ? t('drive.savedDenied', {
            name,
            reason: t(`denyReasons.${denyReason}`),
          })
        : t('drive.saved', { name }),
      'success'
    );
    refresh();
    nextDonor();
  };

  const undo = async (id: string) => {
    setConfirmUndo(null);
    const response = await fetch(`/api/donations/${id}`, {
      method: 'DELETE',
    }).catch(() => null);
    if (!response?.ok) {
      showAlert(t('drive.saveError'), 'error');
      return;
    }
    showAlert(t('drive.removed'), 'info');
    refresh();
  };

  const eligibility = donor?.eligibility;
  const canDonate = eligibility?.status === 'ELIGIBLE';

  return (
    <Stack gap={3}>
      <Typography
        variant='h3'
        component='p'
        role='status'
        sx={{ color: 'text.secondary' }}
      >
        {t('drive.summary', {
          successful: counts?.successful ?? 0,
          denied: counts?.denied ?? 0,
        })}
      </Typography>

      <Card elevation={2}>
        <CardContent>
          <Stack
            direction='row'
            gap={1}
            alignItems='flex-start'
            flexWrap='wrap'
          >
            <Autocomplete
              sx={{ flex: 1, minWidth: 240 }}
              options={searching ? found?.donors || [] : []}
              value={donor}
              inputValue={input}
              onInputChange={(_, value) => setInput(value)}
              onChange={(_, value) => {
                setDonor(value);
                setShowReasons(false);
              }}
              // The API already filtered by name, OIB or phone.
              filterOptions={(options) => options}
              // Keep what was typed when focus moves (e.g. to "New donor",
              // which starts from that name).
              clearOnBlur={false}
              getOptionLabel={(option) => option.fullName || ''}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              loading={searching && isSearching}
              noOptionsText={
                search.length < 2
                  ? t('drive.searchPlaceholder')
                  : t('drive.noResults')
              }
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    <Stack>
                      <span>
                        {option.fullName}
                        {recorded.has(option.id) && (
                          <Chip
                            size='small'
                            color='warning'
                            label={t('drive.alreadyRecorded')}
                            sx={{ ml: 1 }}
                          />
                        )}
                      </span>
                      <Typography variant='body2' color='text.secondary'>
                        {[
                          option.bloodType && BLOOD_TYPES[option.bloodType],
                          option.oib,
                          option.city,
                          eligibilityLabel(option.eligibility, tEligibility),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Typography>
                    </Stack>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={searchRef}
                  autoFocus
                  margin='none'
                  label={t('drive.search')}
                  placeholder={t('drive.searchPlaceholder')}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searching && isSearching && (
                            <CircularProgress color='inherit' size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<MdAdd />}
              onClick={() => setQuickAdd(true)}
              sx={{ height: 56 }}
            >
              {t('drive.newDonor')}
            </Button>
          </Stack>

          {donor && (
            <Box sx={{ mt: 3 }}>
              <Typography variant='h3' component='h2'>
                {donor.fullName}
                {donor.bloodType && ` · ${BLOOD_TYPES[donor.bloodType]}`}
              </Typography>
              {eligibility && (
                <Alert
                  severity={canDonate ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                >
                  {eligibilityReason(eligibility, tEligibility)}
                </Alert>
              )}
              {recorded.has(donor.id) && (
                <Alert severity='warning' sx={{ mt: 1 }}>
                  {t('drive.alreadyRecorded')}
                </Alert>
              )}

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DateTimePicker
                    label={t('drive.time')}
                    value={time}
                    onChange={(value) => setTime(value)}
                    format={DATE_TIME_FORMAT}
                    ampm={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t('drive.note')}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </Grid>
              </Grid>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                gap={2}
                sx={{ mt: 2 }}
              >
                <Button
                  size='large'
                  color='success'
                  startIcon={<MdCheck />}
                  disabled={saving || !time?.isValid()}
                  onClick={() => save(null)}
                  sx={{ color: 'common.white', py: 1.5, flex: 1 }}
                >
                  {t('drive.successful')}
                </Button>
                <Button
                  size='large'
                  variant={showReasons ? 'contained' : 'outlined'}
                  startIcon={<MdClose />}
                  disabled={saving}
                  onClick={() => setShowReasons(!showReasons)}
                  sx={{ py: 1.5, flex: 1 }}
                >
                  {t('drive.denied')}
                </Button>
              </Stack>

              {showReasons && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1 }}>
                    {t('drive.chooseReason')}
                  </Typography>
                  <Grid container spacing={1}>
                    {DENY_REASONS.map((reason) => (
                      <Grid key={reason} size={{ xs: 6, sm: 3 }}>
                        <Button
                          fullWidth
                          variant='outlined'
                          color='inherit'
                          disabled={saving || !time?.isValid()}
                          onClick={() => save(reason)}
                        >
                          {t(`denyReasons.${reason}`)}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardContent>
          <Typography variant='h3' component='h2' sx={{ mb: 2 }}>
            {t('drive.recent')}
          </Typography>
          {recent.length === 0 && (
            <Typography color='text.secondary'>{t('drive.noneYet')}</Typography>
          )}
          <Stack gap={1}>
            {recent.slice(0, 15).map((donation) => (
              <Stack
                key={donation.id}
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                gap={1}
                sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
              >
                <Stack direction='row' alignItems='center' gap={1}>
                  <GoDotFill
                    color={
                      donation.denied
                        ? theme.palette.primary.main
                        : theme.palette.success.main
                    }
                  />
                  <span>
                    {donation.donor?.fullName}
                    <Typography
                      component='span'
                      variant='body2'
                      color='text.secondary'
                    >
                      {' · '}
                      {dayjs(donation.donationDate).format('HH:mm')}
                      {donation.denied &&
                        donation.denyReason &&
                        ` · ${t(`denyReasons.${donation.denyReason}`)}`}
                    </Typography>
                  </span>
                </Stack>
                {confirmUndo === donation.id ? (
                  <Button
                    size='small'
                    color='primary'
                    onClick={() => undo(donation.id)}
                  >
                    {t('drive.confirmUndo')}
                  </Button>
                ) : (
                  <Button
                    size='small'
                    variant='text'
                    color='inherit'
                    startIcon={<MdUndo />}
                    onClick={() => setConfirmUndo(donation.id)}
                  >
                    {t('drive.undo')}
                  </Button>
                )}
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {quickAdd && (
        <QuickDonorDialog
          open
          initialName={donor ? '' : input}
          onClose={() => setQuickAdd(false)}
          onCreated={(created) => {
            setQuickAdd(false);
            setDonor(created);
            setInput(created.fullName || '');
            setShowReasons(false);
            queryClient.invalidateQueries({
              queryKey: reactQueryKeys.donors.all(),
            });
          }}
        />
      )}
    </Stack>
  );
};
