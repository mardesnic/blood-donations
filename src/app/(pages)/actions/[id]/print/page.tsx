import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import React from 'react';
import {
  Breadcrumbs,
  Button,
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
import ActionService from '@/app/api/actions/service';
import { pageTitle } from '@/i18n/metadata';
import { ROUTE_PATHS } from '@/routes';
import { ActionTimes } from '@/components/ActionTimes';
import { PrintButton } from '@/app/(pages)/reports/printButton';
import {
  BLANK_ROWS,
  DRIVE_SHEETS,
  driveSheet,
  EXPECTED_CONTACT_DAYS,
  parseDriveSheet,
} from '@/lib/driveSheets';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sheet?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const action = await ActionService.findOne(id);
  const t = await getTranslations('driveSheets');
  return { title: await pageTitle(`${t('title')} - ${action?.title || ''}`) };
}

// A drive's sheets to print or download: before it, who is expected (with
// boxes to tick at the drive); after it, how it went.
export default async function DrivePrintPage({ params, searchParams }: Props) {
  const { id } = await params;
  const data = await ActionService.sheetData(id);
  if (!data) {
    notFound();
  }
  const { action } = data;
  const t = await getTranslations();
  // Until the drive is over, the expected donors are what's needed.
  const fallback = action.endDateTime < new Date() ? 'results' : 'expected';
  const key = parseDriveSheet((await searchParams).sheet, fallback);
  const sheet = driveSheet(key, data, t);
  const actionPath = `${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${action.id}`;
  const successful = data.results.filter((d) => !d.denied).length;
  const blankRows = key === 'expected' ? BLANK_ROWS : 0;

  return (
    <>
      {/* Landscape fits the columns; the boxes need room to write in. */}
      <style>{`@media print { @page { size: A4 landscape; margin: 12mm; } }`}</style>
      <Breadcrumbs className='no-print'>
        <Link href={ROUTE_PATHS.PROTECTED.ACTIONS.path} className='tap-target'>
          {t('nav.actions')}
        </Link>
        <Link href={actionPath} className='tap-target'>
          {action.title}
        </Link>
        <Typography
          sx={{
            color: 'text.primary',
          }}
        >
          {t('driveSheets.title')}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction='row'
        className='no-print'
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          my: 2,
        }}
      >
        {DRIVE_SHEETS.map((sheetKey) => (
          <Link key={sheetKey} href={`${actionPath}/print?sheet=${sheetKey}`}>
            <Button
              size='medium'
              color='secondary'
              variant={sheetKey === key ? 'contained' : 'outlined'}
              aria-current={sheetKey === key ? 'page' : undefined}
            >
              {t(`driveSheets.${sheetKey}`)}
            </Button>
          </Link>
        ))}
        <PrintButton />
        <Button
          component='a'
          href={`/api/actions/${action.id}/export?sheet=${key}`}
          variant='outlined'
          color='inherit'
          size='medium'
          startIcon={<MdDownload />}
        >
          {t('driveSheets.download')}
        </Button>
      </Stack>

      <Typography variant='h1' sx={{ mb: 0.5 }}>
        {action.title} · {sheet.title}
      </Typography>
      <Typography
        sx={{
          color: 'text.secondary',
        }}
      >
        <ActionTimes start={action.startDateTime} end={action.endDateTime} />
        {action.place
          ? ` · ${[action.place.title, action.place.city]
              .filter(Boolean)
              .join(', ')}`
          : ''}
      </Typography>
      <Typography
        sx={{
          color: 'text.secondary',
          mb: 2,
        }}
      >
        {key === 'expected'
          ? t('driveSheets.expectedHint', { days: EXPECTED_CONTACT_DAYS })
          : t('driveSheets.totals', {
              successful,
              denied: data.results.length - successful,
            })}
      </Typography>

      {!sheet.rows.length && (
        <Typography sx={{ mb: 2 }}>
          {key === 'expected'
            ? t('driveSheets.noExpected')
            : t('driveSheets.noResults')}
        </Typography>
      )}

      {(sheet.rows.length > 0 || blankRows > 0) && (
        <TableContainer>
          <Table
            size='small'
            sx={{
              '& th, & td': { border: '1px solid', borderColor: 'divider' },
              '& th': { fontWeight: 600, whiteSpace: 'nowrap' },
            }}
          >
            <TableHead>
              <TableRow>
                {sheet.columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sheet.rows.map((row) => (
                <TableRow key={row[0]} sx={{ height: 40 }}>
                  {row.map((cell, index) => (
                    <TableCell key={index}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
              {Array.from({ length: blankRows }, (_, index) => (
                <TableRow key={`blank-${index}`} sx={{ height: 40 }}>
                  <TableCell>{sheet.rows.length + index + 1}</TableCell>
                  {sheet.columns.slice(1).map((column) => (
                    <TableCell key={column} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
