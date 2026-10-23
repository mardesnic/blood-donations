'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { MonthTotals } from '@/lib/overviewStats';
import { EmptyState } from '@/components/EmptyState';

// Successful and denied donations per month, stacked.
export const MonthlyChart = ({ months }: { months: MonthTotals[] }) => {
  const theme = useTheme();
  const t = useTranslations('overview');
  const tEmpty = useTranslations('empty');
  const locale = useLocale();
  // "sij 26" / "Jan 26", from the month key.
  const label = (key: string) => {
    const [year, month] = key.split('-').map(Number);
    const name = new Intl.DateTimeFormat(locale, {
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
    return `${name} ${String(year).slice(2)}`;
  };
  // An empty grid of bars says nothing; say it in words instead.
  if (!months.some((m) => m.successful || m.denied)) {
    return <EmptyState message={tEmpty('chart')} />;
  }
  return (
    <BarChart
      height={280}
      margin={{ left: 0, right: 8 }}
      xAxis={[
        {
          scaleType: 'band',
          data: months.map((m) => m.month),
          // The app's larger font needs more than the default 25px, or the
          // chart shortens the month labels to nothing.
          height: 36,
          valueFormatter: label,
        },
      ]}
      yAxis={[{ tickMinStep: 1 }]}
      series={[
        {
          data: months.map((m) => m.successful),
          label: t('successful'),
          stack: 'all',
          color: theme.palette.success.main,
        },
        {
          data: months.map((m) => m.denied),
          label: t('denied'),
          stack: 'all',
          color: theme.palette.primary.main,
        },
      ]}
    />
  );
};
