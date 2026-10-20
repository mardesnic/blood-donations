import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import React, { ReactNode } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import StatsService from '@/app/api/stats/service';
import { pageTitle } from '@/i18n/metadata';
import { BLOOD_TYPES } from '@/lib/const';
import { percentChange, percentOf } from '@/lib/overviewStats';
import { filterModelToSearchParams } from '@/lib/donorFilterModel';
import { getDisplayName } from '@/lib/utils';
import { ROUTE_PATHS } from '@/routes';
import { InfoSection } from '@/components/InfoSection';
import { ActionTimes } from '@/components/ActionTimes';
import { MonthlyChart } from './monthlyChart';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('overview')) };
}

// A big number with its label and a line of context.
const Stat = ({
  label,
  value,
  note,
  noteColor = 'text.secondary',
  href,
}: {
  label: string;
  value: ReactNode;
  note: ReactNode;
  noteColor?: string;
  href?: string;
}) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.3 }}>
        {href ? (
          <Link href={href} style={{ textDecoration: 'underline' }}>
            {value}
          </Link>
        ) : (
          value
        )}
      </Typography>
      <Typography variant='body2' sx={{ color: noteColor }}>
        {note}
      </Typography>
    </CardContent>
  </Card>
);

// The donors list filtered to who can donate now (of one blood type).
const eligibleDonorsUrl = (bloodType?: string) =>
  `${ROUTE_PATHS.PROTECTED.DONORS.path}?${filterModelToSearchParams({
    items: [
      { field: 'eligible', operator: 'is', value: 'NOW' },
      ...(bloodType
        ? [{ field: 'bloodType', operator: 'isAnyOf', value: [bloodType] }]
        : []),
    ],
  })}`;

// The home page: how donating is going this year, who can donate now and
// what's coming up.
export default async function OverviewPage() {
  const t = await getTranslations();
  const stats = await StatsService.overview();
  const change = percentChange(
    stats.successfulThisYear,
    stats.successfulLastYear
  );
  const attempts = stats.successfulThisYear + stats.deniedThisYear;
  const denialRate = percentOf(stats.deniedThisYear, attempts);

  return (
    <>
      <Typography variant='h1'>{t('overview.title')}</Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Stat
            label={t('overview.donationsThisYear')}
            value={stats.successfulThisYear}
            note={
              change === null
                ? t('overview.noComparison')
                : t('overview.vsLastYear', { change })
            }
            noteColor={
              change === null || change === 0
                ? 'text.secondary'
                : change > 0
                  ? 'success.main'
                  : 'primary.main'
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Stat
            label={t('overview.canDonateNow')}
            value={stats.eligibleDonors}
            note={t('overview.ofActive', { count: stats.activeDonors })}
            href={eligibleDonorsUrl()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Stat
            label={t('overview.newDonors')}
            value={stats.newDonors}
            note={t('overview.newDonorsNote')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Stat
            label={t('overview.denialRate')}
            value={denialRate === null ? '—' : `${denialRate}%`}
            note={
              attempts
                ? t('overview.deniedOf', {
                    denied: stats.deniedThisYear,
                    total: attempts,
                  })
                : t('overview.noAttempts')
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <InfoSection title={t('overview.monthly')}>
            <MonthlyChart months={stats.months} />
          </InfoSection>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoSection title={t('overview.denyReasons')}>
            {stats.denyReasons.length ? (
              stats.denyReasons.map(({ reason, count }) => (
                <Stack
                  key={reason ?? 'unknown'}
                  direction='row'
                  sx={{
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    {reason ? t(`denyReasons.${reason}`) : t('common.unknown')}
                  </span>
                  <strong>{count}</strong>
                </Stack>
              ))
            ) : (
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                {t('overview.noDenials')}
              </Typography>
            )}
          </InfoSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <InfoSection title={t('overview.bloodTypes')}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>{t('fields.bloodType')}</TableCell>
                  <TableCell align='right'>{t('overview.active')}</TableCell>
                  <TableCell align='right'>{t('overview.eligible')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.bloodTypes.map((row) => (
                  <TableRow key={row.bloodType ?? 'unknown'}>
                    <TableCell>
                      {row.bloodType
                        ? BLOOD_TYPES[row.bloodType]
                        : t('common.unknown')}
                    </TableCell>
                    <TableCell align='right'>{row.active}</TableCell>
                    <TableCell align='right'>
                      {/* Opens the call list for that blood type. */}
                      {row.bloodType && row.eligible ? (
                        <Link
                          href={eligibleDonorsUrl(row.bloodType)}
                          style={{ textDecoration: 'underline' }}
                          className='tap-target'
                        >
                          {row.eligible}
                        </Link>
                      ) : (
                        row.eligible
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfoSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack
            sx={{
              gap: 3,
              height: '100%',
              // The two cards share the column instead of each taking all
              // of its height (and overflowing onto the cards below).
              '& > .MuiCard-root': { height: 'auto', flex: '1 0 auto' },
            }}
          >
            <InfoSection title={t('overview.upcoming')}>
              {stats.upcomingActions.length ? (
                stats.upcomingActions.map((action) => (
                  <ActionLine key={action.id} action={action} />
                ))
              ) : (
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {t('overview.noUpcoming')}
                </Typography>
              )}
            </InfoSection>
            <InfoSection title={t('overview.recent')}>
              {stats.recentActions.length ? (
                stats.recentActions.map((action) => (
                  <ActionLine
                    key={action.id}
                    action={action}
                    result={t('overview.result', {
                      successful: action.successful,
                      denied: action.denied,
                    })}
                  />
                ))
              ) : (
                <Typography
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {t('overview.noRecent')}
                </Typography>
              )}
            </InfoSection>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <InfoSection title={t('milestones.close')}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('milestones.closeHint')}
            </Typography>
            {stats.nearMilestone.donors.length ? (
              <Table size='small'>
                <TableBody>
                  {stats.nearMilestone.donors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <Link
                          href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${donor.id}`}
                          style={{ textDecoration: 'underline' }}
                          className='tap-target'
                        >
                          {getDisplayName([donor.firstName, donor.lastName])}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {donor.bloodType ? BLOOD_TYPES[donor.bloodType] : ''}
                      </TableCell>
                      <TableCell align='right'>
                        {t('milestones.reachesNext', {
                          milestone: donor.milestone,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>
                {t('milestones.noneClose')}
              </Typography>
            )}
            {stats.nearMilestone.count > stats.nearMilestone.donors.length && (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {t('milestones.more', {
                  count:
                    stats.nearMilestone.count -
                    stats.nearMilestone.donors.length,
                })}
              </Typography>
            )}
          </InfoSection>
        </Grid>
      </Grid>
    </>
  );
}

// An action: linked title, when and where, and optionally how it went.
const ActionLine = ({
  action,
  result,
}: {
  action: {
    id: string;
    title: string;
    place: string | null;
    startDateTime: Date;
    endDateTime: Date;
  };
  result?: string;
}) => (
  <div>
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
      {action.place ? ` · ${action.place}` : ''}
    </Typography>
    {result && <Typography variant='body2'>{result}</Typography>}
  </div>
);
