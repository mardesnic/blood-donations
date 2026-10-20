'use client';

import React, { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DATE_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';

const QUARTERS = [1, 2, 3, 4] as const;
const quarterRange = (year: number, quarter: number) => ({
  from: dayjs(new Date(year, (quarter - 1) * 3, 1)),
  to: dayjs(new Date(year, quarter * 3, 0)),
});

interface Props {
  // "YYYY-MM-DD", both ends included.
  from: string;
  to: string;
  currentYear: number;
}

// Picks the report period: a year, one of its quarters, or any from-to
// dates. The choice goes into the URL, so a report can be bookmarked.
export const PeriodPicker = ({ from, to, currentYear }: Props) => {
  const t = useTranslations('reports');
  const router = useRouter();
  const start = dayjs(from);
  const end = dayjs(to);

  // Which preset the URL matches, if any.
  const year = start.year();
  const isWholeYear =
    start.isSame(dayjs(new Date(year, 0, 1)), 'day') &&
    end.isSame(dayjs(new Date(year, 11, 31)), 'day');
  const quarter = QUARTERS.find((q) => {
    const range = quarterRange(year, q);
    return start.isSame(range.from, 'day') && end.isSame(range.to, 'day');
  });
  const [part, setPart] = useState<string>(
    isWholeYear ? 'year' : quarter ? `q${quarter}` : 'custom'
  );
  const [customFrom, setCustomFrom] = useState<Dayjs | null>(start);
  const [customTo, setCustomTo] = useState<Dayjs | null>(end);

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  if (!years.includes(year)) {
    years.push(year);
  }

  const show = (newFrom: Dayjs, newTo: Dayjs) =>
    router.push(
      `${ROUTE_PATHS.PROTECTED.REPORTS.path}?${new URLSearchParams({
        from: newFrom.format('YYYY-MM-DD'),
        to: newTo.format('YYYY-MM-DD'),
      })}`
    );
  const showPreset = (newYear: number, newPart: string) => {
    if (newPart === 'year') {
      show(dayjs(new Date(newYear, 0, 1)), dayjs(new Date(newYear, 11, 31)));
    } else if (newPart.startsWith('q')) {
      const range = quarterRange(newYear, Number(newPart.slice(1)));
      show(range.from, range.to);
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      className='no-print'
      sx={{
        gap: 2,
        alignItems: { sm: 'center' },
      }}
    >
      {part !== 'custom' && (
        <TextField
          select
          label={t('year')}
          value={year}
          onChange={(event) => showPreset(Number(event.target.value), part)}
          sx={{ minWidth: 120 }}
          fullWidth={false}
          margin='none'
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        select
        label={t('part')}
        value={part}
        onChange={(event) => {
          setPart(event.target.value);
          showPreset(year, event.target.value);
        }}
        sx={{ minWidth: 180 }}
        fullWidth={false}
        margin='none'
      >
        <MenuItem value='year'>{t('wholeYear')}</MenuItem>
        {QUARTERS.map((q) => (
          <MenuItem key={q} value={`q${q}`}>
            {t('quarter', { n: q })}
          </MenuItem>
        ))}
        <MenuItem value='custom'>{t('custom')}</MenuItem>
      </TextField>
      {part === 'custom' && (
        <>
          <DatePicker
            label={t('from')}
            value={customFrom}
            onChange={setCustomFrom}
            format={DATE_FORMAT}
            slotProps={{ textField: { margin: 'none', fullWidth: false } }}
          />
          <DatePicker
            label={t('to')}
            value={customTo}
            onChange={setCustomTo}
            format={DATE_FORMAT}
            slotProps={{ textField: { margin: 'none', fullWidth: false } }}
          />
          <Button
            color='secondary'
            disabled={!customFrom?.isValid() || !customTo?.isValid()}
            onClick={() => customFrom && customTo && show(customFrom, customTo)}
          >
            {t('show')}
          </Button>
        </>
      )}
    </Stack>
  );
};
