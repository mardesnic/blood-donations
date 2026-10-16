import dayjs from 'dayjs';
import { DATE_FORMAT } from './const';

// Calendar dates (date of birth, last donation) are stored as UTC midnight of
// the day. Donation times are real moments; their calendar day is taken in the
// time zone the donations happen in.
export const APP_TIME_ZONE = 'Europe/Zagreb';

const DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Parses "YYYY-MM-DD" (anything after the date is ignored) into UTC midnight.
export function parseDay(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  if (!match) {
    return null;
  }
  const [year, month, day] = [+match[1], +match[2], +match[3]];
  const date = new Date(Date.UTC(year, month - 1, day));
  // Reject dates that roll over, such as 2026-02-31.
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date
    : null;
}

// The calendar day of a moment in APP_TIME_ZONE, as UTC midnight.
export function toAppDay(moment: Date | null | undefined): Date | null {
  if (!moment || Number.isNaN(moment.getTime())) {
    return null;
  }
  return parseDay(DAY_FORMAT.format(moment));
}

// "YYYY-MM-DD" of a stored calendar date (UTC midnight), or '' when empty.
export function toDayString(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

// A stored calendar date formatted for display, or '' when empty.
export function formatDay(value: Date | string | null | undefined): string {
  const day = toDayString(value);
  return day ? dayjs(day).format(DATE_FORMAT) : '';
}
