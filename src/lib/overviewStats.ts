import { addDays, addMonths, appDayStart } from '@/lib/dates';

// Helpers for the overview page. `today` is the app's calendar day as UTC
// midnight (see toAppDay); donation dates are real moments, so periods are
// turned into moments with appDayStart.

// "YYYY-MM" for the `count` months up to and including today's month, oldest
// first.
export function monthKeys(today: Date, count = 12): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const month = addMonths(
      new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
      -i
    );
    keys.push(
      `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, '0')}`
    );
  }
  return keys;
}

export interface MonthRow {
  month: string;
  denied: boolean;
  count: number;
}

export interface MonthTotals {
  month: string;
  successful: number;
  denied: number;
}

// One entry per month key, with months without donations as zero.
export function fillMonths(
  rows: MonthRow[] | null | undefined,
  keys: string[]
): MonthTotals[] {
  const totals = new Map(
    keys.map((month) => [month, { month, successful: 0, denied: 0 }])
  );
  for (const row of rows || []) {
    const entry = totals.get(row.month);
    if (entry) {
      entry[row.denied ? 'denied' : 'successful'] += Number(row.count) || 0;
    }
  }
  return [...totals.values()];
}

// Percentage change from `previous` to `current`, rounded; null when there
// is nothing to compare with.
export function percentChange(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  if (!previous || current === null || current === undefined) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

// `part` as a rounded percentage of `total`; null for an empty total.
export function percentOf(
  part: number | null | undefined,
  total: number | null | undefined
): number | null {
  if (!total || part === null || part === undefined) {
    return null;
  }
  return Math.round((part / total) * 100);
}

// This year so far and the same stretch of last year, as moments:
// [from, to) for each.
export function yearToDatePeriods(today: Date) {
  const year = today.getUTCFullYear();
  const thisYear = {
    from: appDayStart(new Date(Date.UTC(year, 0, 1))),
    to: appDayStart(addDays(today, 1)),
  };
  const lastYear = {
    from: appDayStart(new Date(Date.UTC(year - 1, 0, 1))),
    to: appDayStart(addDays(addMonths(today, -12), 1)),
  };
  return { thisYear, lastYear };
}
