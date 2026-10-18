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

const DAY_MS = 24 * 60 * 60 * 1000;

// Adds days to a calendar date (UTC midnight).
export function addDays(day: Date, days: number): Date {
  return new Date(day.getTime() + days * DAY_MS);
}

// Adds calendar months, clamping to the month's last day (Jan 31 + 1 month =
// Feb 28/29).
export function addMonths(day: Date, months: number): Date {
  const year = day.getUTCFullYear();
  const month = day.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day.getUTCDate(), lastDay)));
}

// Age in whole years on `today`, with the same month arithmetic as the
// eligibility rules (born 29 February: a year older on 28 February). Null
// when the date of birth is missing, invalid or after today.
export function ageOn(
  dob: Date | string | null | undefined,
  today: Date
): number | null {
  const birth = dob ? new Date(dob) : null;
  if (!birth || Number.isNaN(birth.getTime()) || birth > today) {
    return null;
  }
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (addMonths(birth, age * 12) > today) {
    age -= 1;
  }
  return age;
}

// The latest start day whose period, as computed by `end`, is over by
// `today` (end(start) <= today). `end` must never go backwards in time.
// Lets a database query ask "start <= X" with the same calendar rules as the
// per-donor calculation.
export function latestStartEndingBy(
  today: Date,
  end: (start: Date) => Date,
  approximateStart: Date
): Date {
  let start = approximateStart;
  while (end(start) > today) {
    start = addDays(start, -1);
  }
  while (end(addDays(start, 1)) <= today) {
    start = addDays(start, 1);
  }
  return start;
}

// The moment a calendar day begins in APP_TIME_ZONE.
export function appDayStart(day: Date): Date {
  // Zagreb is UTC+1 or UTC+2, so local midnight is 22:00 or 23:00 UTC the
  // day before.
  for (const hours of [2, 1]) {
    const candidate = new Date(day.getTime() - hours * 60 * 60 * 1000);
    const back = toAppDay(candidate);
    if (back && back.getTime() === day.getTime()) {
      return candidate;
    }
  }
  return day;
}
