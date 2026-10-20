import { describe, expect, it } from 'vitest';
import {
  milestoneDates,
  nextMilestone,
  ONE_BEFORE_MILESTONE,
  reachedMilestone,
} from '@/lib/milestones';

const day = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe('reachedMilestone', () => {
  it('is null for null, undefined, zero and invalid counts', () => {
    expect(reachedMilestone(null)).toBeNull();
    expect(reachedMilestone(undefined)).toBeNull();
    expect(reachedMilestone(0)).toBeNull();
    expect(reachedMilestone(-5)).toBeNull();
    expect(reachedMilestone(NaN)).toBeNull();
    expect(reachedMilestone(9)).toBeNull();
  });

  it('is the highest milestone reached', () => {
    expect(reachedMilestone(10)).toBe(10);
    expect(reachedMilestone(29)).toBe(20);
    expect(reachedMilestone(74)).toBe(50);
    expect(reachedMilestone(130)).toBe(100);
  });
});

describe('nextMilestone', () => {
  it('starts at 10 for null, undefined and zero', () => {
    expect(nextMilestone(null)).toEqual({ milestone: 10, remaining: 10 });
    expect(nextMilestone(undefined)).toEqual({ milestone: 10, remaining: 10 });
    expect(nextMilestone(0)).toEqual({ milestone: 10, remaining: 10 });
  });

  it('counts the donations still needed, and ends after 100', () => {
    expect(nextMilestone(10)).toEqual({ milestone: 20, remaining: 10 });
    expect(nextMilestone(73)).toEqual({ milestone: 75, remaining: 2 });
    expect(nextMilestone(99)).toEqual({ milestone: 100, remaining: 1 });
    expect(nextMilestone(100)).toBeNull();
  });
});

describe('ONE_BEFORE_MILESTONE', () => {
  it('is one short of each milestone', () => {
    expect(ONE_BEFORE_MILESTONE).toEqual([9, 19, 29, 39, 49, 74, 99]);
  });
});

describe('milestoneDates', () => {
  it('is empty for null, undefined and empty input', () => {
    expect(milestoneDates(null, null, null)).toEqual([]);
    expect(milestoneDates(undefined, undefined, undefined)).toEqual([]);
    expect(milestoneDates(0, null, [])).toEqual([]);
  });

  it('dates milestones from the recorded donations, in date order', () => {
    const dates = Array.from(
      { length: 12 },
      (_, i) =>
        // Donations at 10:00 in Zagreb, given out of order.
        new Date(Date.UTC(2020 + (11 - i), 2, 1, 9))
    );
    expect(milestoneDates(0, null, [...dates, null])).toEqual([
      { milestone: 10, date: day('2029-03-01') },
    ]);
  });

  it('uses the day in Zagreb', () => {
    const dates = Array.from(
      { length: 10 },
      // 23:30 UTC on 31 December is already 1 January in Zagreb.
      (_, i) => new Date(Date.UTC(2010 + i, 11, 31, 23, 30))
    );
    expect(milestoneDates(0, null, dates)).toEqual([
      { milestone: 10, date: day('2020-01-01') },
    ]);
  });

  it('counts the donations from before the records first', () => {
    const recorded = [
      new Date('2026-03-01T09:00:00.000Z'),
      new Date('2026-07-01T09:00:00.000Z'),
    ];
    // 18 before the records, the last on 1 October 2025: the 10th has no
    // known day, the 20th is the second recorded donation.
    expect(milestoneDates(18, day('2025-10-01'), recorded)).toEqual([
      { milestone: 10, date: null },
      { milestone: 20, date: day('2026-07-01') },
    ]);
    // Exactly 20 before the records: the 20th was the last of them.
    expect(milestoneDates(20, day('2025-10-01'), [])).toEqual([
      { milestone: 10, date: null },
      { milestone: 20, date: day('2025-10-01') },
    ]);
    expect(milestoneDates(20, null, [])).toEqual([
      { milestone: 10, date: null },
      { milestone: 20, date: null },
    ]);
  });
});
