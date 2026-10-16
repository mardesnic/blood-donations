import { describe, expect, it } from 'vitest';
import { formatDay, parseDay, toAppDay, toDayString } from '@/lib/dates';

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
