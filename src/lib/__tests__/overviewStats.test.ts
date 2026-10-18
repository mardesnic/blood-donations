import { describe, expect, it } from 'vitest';
import {
  fillMonths,
  monthKeys,
  percentChange,
  percentOf,
  yearToDatePeriods,
} from '@/lib/overviewStats';

const day = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe('monthKeys', () => {
  it('lists the last 12 months up to today, across a year end', () => {
    const keys = monthKeys(day('2026-02-15'));
    expect(keys).toHaveLength(12);
    expect(keys[0]).toBe('2025-03');
    expect(keys[10]).toBe('2026-01');
    expect(keys[11]).toBe('2026-02');
  });

  it('works on the last day of a long month', () => {
    expect(monthKeys(day('2026-03-31'), 3)).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
    ]);
  });
});

describe('fillMonths', () => {
  const keys = ['2026-01', '2026-02', '2026-03'];

  it('fills every month with zeros for null, undefined and empty input', () => {
    for (const rows of [null, undefined, []]) {
      expect(fillMonths(rows, keys)).toEqual([
        { month: '2026-01', successful: 0, denied: 0 },
        { month: '2026-02', successful: 0, denied: 0 },
        { month: '2026-03', successful: 0, denied: 0 },
      ]);
    }
  });

  it('splits successful and denied, and ignores months outside the range', () => {
    expect(
      fillMonths(
        [
          { month: '2026-01', denied: false, count: 5 },
          { month: '2026-01', denied: true, count: 2 },
          { month: '2026-03', denied: false, count: 1 },
          { month: '2025-12', denied: false, count: 9 },
        ],
        keys
      )
    ).toEqual([
      { month: '2026-01', successful: 5, denied: 2 },
      { month: '2026-02', successful: 0, denied: 0 },
      { month: '2026-03', successful: 1, denied: 0 },
    ]);
  });
});

describe('percentChange and percentOf', () => {
  it('returns null when there is nothing to compare with', () => {
    for (const empty of [0, null, undefined]) {
      expect(percentChange(5, empty)).toBeNull();
      expect(percentOf(5, empty)).toBeNull();
    }
    expect(percentChange(null, 5)).toBeNull();
    expect(percentOf(undefined, 5)).toBeNull();
  });

  it('rounds to whole percents', () => {
    expect(percentChange(212, 196)).toBe(8);
    expect(percentChange(90, 100)).toBe(-10);
    expect(percentOf(1, 3)).toBe(33);
  });
});

describe('yearToDatePeriods', () => {
  it('covers 1 January to the end of today, and the same days last year', () => {
    const { thisYear, lastYear } = yearToDatePeriods(day('2026-10-18'));
    // Zagreb midnight is 23:00 UTC in winter and 22:00 UTC in summer.
    expect(thisYear.from).toEqual(new Date('2025-12-31T23:00:00.000Z'));
    expect(thisYear.to).toEqual(new Date('2026-10-18T22:00:00.000Z'));
    expect(lastYear.from).toEqual(new Date('2024-12-31T23:00:00.000Z'));
    expect(lastYear.to).toEqual(new Date('2025-10-18T22:00:00.000Z'));
  });
});
