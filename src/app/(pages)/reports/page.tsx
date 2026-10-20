import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Link as MuiLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { MdDownload } from 'react-icons/md';
import StatsService from '@/app/api/stats/service';
import { pageTitle } from '@/i18n/metadata';
import { formatDay, toAppDay, toDayString } from '@/lib/dates';
import { parseReportPeriod } from '@/lib/reports';
import { ReportTable, reportTables } from '@/lib/reportTables';
import { PeriodPicker } from './periodPicker';
import { PrintButton } from './printButton';

type Props = {
  searchParams: Promise<{
    from?: string | string[];
    to?: string | string[];
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('reports')) };
}

// One report table in a card, with a link to download it as an Excel file.
const ReportCard = ({
  table,
  downloadUrl,
  downloadLabel,
  emptyText,
}: {
  table: ReportTable;
  downloadUrl: string;
  downloadLabel: string;
  emptyText: string;
}) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Stack
        direction='row'
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant='h3' component='h2'>
          {table.title}
        </Typography>
        {table.rows.length > 0 && (
          <MuiLink
            href={downloadUrl}
            color='secondary'
            variant='body2'
            className='no-print tap-target'
          >
            <MdDownload style={{ marginRight: 4 }} />
            {downloadLabel}
          </MuiLink>
        )}
      </Stack>
      {table.rows.length ? (
        // Wide tables (by action) scroll sideways on phones instead of
        // sticking out of the card.
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                {table.columns.map((column, i) => (
                  <TableCell
                    key={column}
                    align={table.numeric[i] ? 'right' : 'left'}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((row, r) => (
                <TableRow key={r}>
                  {row.map((cell, i) => (
                    <TableCell
                      key={i}
                      align={table.numeric[i] ? 'right' : 'left'}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography
          sx={{
            color: 'text.secondary',
          }}
        >
          {emptyText}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Donations for a chosen period, as tables that can be downloaded as Excel
// files or printed.
export default async function ReportsPage({ searchParams }: Props) {
  const { from, to } = await searchParams;
  const today = toAppDay(new Date()) as Date;
  const period = parseReportPeriod(from, to, today);
  const t = await getTranslations();
  const report = await StatsService.report(period);
  const tables = reportTables(report, t, await getLocale());
  const table = (key: ReportTable['key']) => {
    const item = tables.find((x) => x.key === key)!;
    return (
      <ReportCard
        table={item}
        downloadUrl={`/api/reports/export?${new URLSearchParams({
          from: toDayString(period.from),
          to: toDayString(period.to),
          table: key,
        })}`}
        downloadLabel={t('reports.excel')}
        emptyText={t('reports.empty')}
      />
    );
  };

  return (
    <>
      <Stack
        direction='row'
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant='h1' sx={{ mb: 0 }}>
          {t('reports.title')}
        </Typography>
        <PrintButton />
      </Stack>

      <Stack
        sx={{
          gap: 1,
          mt: 3,
          mb: 3,
        }}
      >
        <PeriodPicker
          // A new period starts the picker again from the URL.
          key={`${toDayString(period.from)}_${toDayString(period.to)}`}
          from={toDayString(period.from)}
          to={toDayString(period.to)}
          currentYear={today.getUTCFullYear()}
        />
        <Typography sx={{ mt: 1 }}>
          {t('reports.periodText', {
            from: formatDay(period.from),
            to: formatDay(period.to),
          })}
        </Typography>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
          }}
        >
          {t('reports.note')}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>{table('totals')}</Grid>
        <Grid size={{ xs: 12, md: 7 }}>{table('months')}</Grid>
        <Grid size={12}>{table('actions')}</Grid>
        <Grid size={{ xs: 12, md: 4 }}>{table('bloodTypes')}</Grid>
        <Grid size={{ xs: 12, md: 4 }}>{table('genderAge')}</Grid>
        <Grid size={{ xs: 12, md: 4 }}>{table('denyReasons')}</Grid>
        <Grid size={12}>{table('milestones')}</Grid>
      </Grid>
    </>
  );
}
