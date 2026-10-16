import { describe, expect, it } from 'vitest';
import { computeDonorStats } from '@/lib/donorStats';

const day = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe('computeDonorStats', () => {
  it('treats null and undefined input as zero and no date', () => {
    expect(computeDonorStats(null, null, null, null)).toEqual({
      donationCount: 0,
      lastDonation: null,
    });
    expect(
      computeDonorStats(undefined, undefined, undefined, undefined)
    ).toEqual({
      donationCount: 0,
      lastDonation: null,
    });
  });

  it('keeps the starting values when nothing is recorded', () => {
    expect(computeDonorStats(12, day('2025-03-01'), 0, null)).toEqual({
      donationCount: 12,
      lastDonation: day('2025-03-01'),
    });
  });

  it('adds recorded donations and uses the later date', () => {
    expect(
      computeDonorStats(
        12,
        day('2025-03-01'),
        2,
        new Date('2026-06-10T09:00:00Z')
      )
    ).toEqual({ donationCount: 14, lastDonation: day('2026-06-10') });
  });

  it('keeps a later starting date', () => {
    expect(
      computeDonorStats(
        3,
        day('2026-09-01'),
        1,
        new Date('2026-01-10T09:00:00Z')
      )
    ).toEqual({ donationCount: 4, lastDonation: day('2026-09-01') });
  });
});
