import { describe, expect, it } from 'vitest';
import { donorOrderBy } from '@/lib/donorSort';

describe('donorOrderBy', () => {
  it('falls back to newest first for null, undefined and empty input', () => {
    for (const empty of [null, undefined, '']) {
      expect(donorOrderBy(empty, empty)).toEqual([
        { createdAt: 'desc' },
        { id: 'asc' },
      ]);
    }
  });

  it('puts empty values last in both directions', () => {
    expect(donorOrderBy('lastDonation', 'desc')).toEqual([
      { lastDonation: { sort: 'desc', nulls: 'last' } },
      { id: 'asc' },
    ]);
    expect(donorOrderBy('fullName', 'asc')).toEqual([
      { fullName: { sort: 'asc', nulls: 'last' } },
      { id: 'asc' },
    ]);
  });

  it('sorts required columns plainly, with id as a tie-breaker', () => {
    expect(donorOrderBy('donationCount', 'asc')).toEqual([
      { donationCount: 'asc' },
      { id: 'asc' },
    ]);
  });
});
