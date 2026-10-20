import { describe, expect, it } from 'vitest';
import {
  ageOn,
  formatAppDateTime,
  formatDay,
  parseDay,
  toAppDay,
  toAppWallClock,
  toDayString,
} from '@/lib/dates';

describe('parseDay', () => {
  it('returns null for null, undefined, empty and malformed input', () => {
    expect(parseDay(null)).toBeNull();
    expect(parseDay(undefined)).toBeNull();
    expect(parseDay('')).toBeNull();
    expect(parseDay('1.5.1990')).toBeNull();
    expect(parseDay('2026-02-31')).toBeNull();
  });

  it('parses a day as UTC midnight and ignores a time part', () => {
    const expected = new Date('1990-05-01T00:00:00.000Z');
    expect(parseDay('1990-05-01')).toEqual(expected);
    expect(parseDay('1990-05-01T00:00:00.000Z')).toEqual(expected);
  });
});

describe('toAppDay', () => {
  it('returns null for null, undefined and invalid dates', () => {
    expect(toAppDay(null)).toBeNull();
    expect(toAppDay(undefined)).toBeNull();
    expect(toAppDay(new Date('nope'))).toBeNull();
  });

  it('uses the calendar day in Zagreb, not UTC', () => {
    // 00:30 in Zagreb (summer time) is still the previous day in UTC.
    expect(toAppDay(new Date('2026-07-01T22:30:00.000Z'))).toEqual(
      new Date('2026-07-02T00:00:00.000Z')
    );
    expect(toAppDay(new Date('2026-07-01T10:00:00.000Z'))).toEqual(
      new Date('2026-07-01T00:00:00.000Z')
    );
  });
});

describe('toDayString', () => {
  it('returns an empty string for null, undefined, empty and invalid input', () => {
    expect(toDayString(null)).toBe('');
    expect(toDayString(undefined)).toBe('');
    expect(toDayString('')).toBe('');
    expect(toDayString('nope')).toBe('');
  });

  it('returns the stored calendar day', () => {
    expect(toDayString(new Date('1990-05-01T00:00:00.000Z'))).toBe(
      '1990-05-01'
    );
    expect(toDayString('1990-05-01T00:00:00.000Z')).toBe('1990-05-01');
  });
});

describe('formatDay', () => {
  it('returns an empty string for null, undefined, empty and invalid input', () => {
    expect(formatDay(null)).toBe('');
    expect(formatDay(undefined)).toBe('');
    expect(formatDay('')).toBe('');
    expect(formatDay('nope')).toBe('');
  });

  it('formats the stored day as DD.MM.YYYY.', () => {
    expect(formatDay(new Date('1990-05-01T00:00:00.000Z'))).toBe('01.05.1990.');
  });
});

describe('ageOn', () => {
  const day = (value: string) => new Date(`${value}T00:00:00.000Z`);
  const today = day('2026-10-18');

  it('returns null for null, undefined, empty, invalid and future input', () => {
    for (const dob of [null, undefined, '', 'not a date', day('2027-01-01')]) {
      expect(ageOn(dob, today)).toBeNull();
    }
  });

  it('counts whole years, turning older on the birthday', () => {
    expect(ageOn(day('1990-10-18'), today)).toBe(36);
    expect(ageOn(day('1990-10-19'), today)).toBe(35);
    expect(ageOn('1990-05-01T00:00:00.000Z', today)).toBe(36);
    expect(ageOn(day('2026-10-18'), today)).toBe(0);
  });

  it('treats a 29 February birthday like the eligibility rules', () => {
    expect(ageOn(day('2008-02-29'), day('2026-02-27'))).toBe(17);
    expect(ageOn(day('2008-02-29'), day('2026-02-28'))).toBe(18);
  });
});

describe('formatAppDateTime', () => {
  it('is empty for null, undefined, empty and invalid input', () => {
    expect(formatAppDateTime(null)).toBe('');
    expect(formatAppDateTime(undefined)).toBe('');
    expect(formatAppDateTime('')).toBe('');
    expect(formatAppDateTime('nope')).toBe('');
  });

  it('shows the time in Zagreb, summer and winter', () => {
    expect(formatAppDateTime('2026-10-18T21:30:00.000Z')).toBe(
      '18.10.2026. 23:30'
    );
    expect(formatAppDateTime(new Date('2026-12-31T23:30:00.000Z'))).toBe(
      '01.01.2027. 00:30'
    );
  });
});

describe('toAppWallClock', () => {
  it('is null for null, undefined, empty and invalid input', () => {
    expect(toAppWallClock(null)).toBeNull();
    expect(toAppWallClock(undefined)).toBeNull();
    expect(toAppWallClock('')).toBeNull();
    expect(toAppWallClock('nope')).toBeNull();
  });

  it('writes the time in Zagreb as UTC', () => {
    // Summer time (UTC+2) and winter time (UTC+1).
    expect(toAppWallClock('2026-10-18T21:30:00.000Z')).toEqual(
      new Date('2026-10-18T23:30:00.000Z')
    );
    expect(toAppWallClock(new Date('2026-12-31T23:15:00.000Z'))).toEqual(
      new Date('2027-01-01T00:15:00.000Z')
    );
  });
});
