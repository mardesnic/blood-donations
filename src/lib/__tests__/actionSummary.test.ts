import { describe, expect, it } from 'vitest';
import { summarizeActionDonations } from '@/lib/actionSummary';

const ok = (bloodType: string | null) => ({
  denied: false,
  denyReason: null,
  donor: { bloodType },
});
const no = (denyReason: string | null) => ({
  denied: true,
  denyReason,
  donor: { bloodType: 'A_POSITIVE' },
});

describe('summarizeActionDonations', () => {
  it('returns zeros for null, undefined and empty input', () => {
    for (const empty of [null, undefined, []]) {
      expect(summarizeActionDonations(empty)).toEqual({
        successful: 0,
        denied: 0,
        denyReasons: [],
        bloodTypes: [],
      });
    }
  });

  it('counts successful and denied donations', () => {
    const summary = summarizeActionDonations([
      ok('O_POSITIVE'),
      ok('A_POSITIVE'),
      ok('O_POSITIVE'),
      no('SEVEN_DAYS'),
      no('ONE_MONTH'),
      no('SEVEN_DAYS'),
    ]);
    expect(summary.successful).toBe(3);
    expect(summary.denied).toBe(3);
    expect(summary.denyReasons).toEqual([
      { reason: 'SEVEN_DAYS', count: 2 },
      { reason: 'ONE_MONTH', count: 1 },
    ]);
  });

  it('lists blood types of successful donations only, most common first', () => {
    const summary = summarizeActionDonations([
      ok('A_POSITIVE'),
      ok(null),
      ok('O_NEGATIVE'),
      ok('O_NEGATIVE'),
      { denied: false, denyReason: null, donor: null },
      no('SEVEN_DAYS'),
    ]);
    // Ties keep the usual blood type order, unknown last.
    expect(summary.bloodTypes).toEqual([
      { bloodType: 'O_NEGATIVE', count: 2 },
      { bloodType: null, count: 2 },
      { bloodType: 'A_POSITIVE', count: 1 },
    ]);
  });
});
