import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  appDayStart,
  latestStartEndingBy,
} from '@/lib/dates';
import { computeEligibility, EligibilityInput } from '@/lib/eligibility';

const day = (value: string) => new Date(`${value}T00:00:00.000Z`);
const TODAY = day('2026-10-16');
const adult: EligibilityInput = {
  gender: 'MALE',
  dob: day('1990-05-01'),
  active: true,
  lastDonation: null,
  denials: [],
};

describe('calendar helpers', () => {
  it('clamps months to the last day', () => {
    expect(addMonths(day('2026-01-31'), 1)).toEqual(day('2026-02-28'));
    expect(addMonths(day('2024-02-29'), 12)).toEqual(day('2025-02-28'));
    expect(addMonths(day('2026-11-30'), 3)).toEqual(day('2027-02-28'));
  });

  it('finds the latest start whose period is over', () => {
    const end = (d: Date) => addMonths(d, 3);
    const start = latestStartEndingBy(
      day('2027-02-28'),
      end,
      day('2026-11-28')
    );
    expect(start).toEqual(day('2026-11-30'));
    expect(end(start) <= day('2027-02-28')).toBe(true);
    expect(end(addDays(start, 1)) > day('2027-02-28')).toBe(true);
  });

  it('gives the moment a Zagreb day starts', () => {
    expect(appDayStart(day('2026-07-01'))).toEqual(
      new Date('2026-06-30T22:00:00.000Z')
    );
    expect(appDayStart(day('2026-01-15'))).toEqual(
      new Date('2026-01-14T23:00:00.000Z')
    );
  });
});

describe('computeEligibility', () => {
  it('is eligible with no history', () => {
    expect(computeEligibility(adult, TODAY).status).toBe('ELIGIBLE');
  });

  it('handles null and empty values', () => {
    expect(computeEligibility({ ...adult, dob: null }, TODAY).status).toBe(
      'UNKNOWN_AGE'
    );
    expect(
      computeEligibility(
        { ...adult, denials: [{ donationDate: '', denyReason: null }] },
        TODAY
      ).status
    ).toBe('ELIGIBLE');
  });

  it('waits 3 months for men and 4 for women', () => {
    const last = day('2026-08-01');
    const man = computeEligibility({ ...adult, lastDonation: last }, TODAY);
    expect(man).toMatchObject({
      status: 'NOT_YET',
      nextEligible: day('2026-11-01'),
    });
    const woman = computeEligibility(
      { ...adult, gender: 'FEMALE', lastDonation: last },
      TODAY
    );
    expect(woman.nextEligible).toEqual(day('2026-12-01'));
    expect(
      computeEligibility({ ...adult, lastDonation: day('2026-07-16') }, TODAY)
        .status
    ).toBe('ELIGIBLE');
  });

  it('blocks for the denial period without resetting the gap', () => {
    const denied = computeEligibility(
      {
        ...adult,
        denials: [
          {
            donationDate: new Date('2026-10-10T09:00:00Z'),
            denyReason: 'ONE_MONTH',
          },
        ],
      },
      TODAY
    );
    expect(denied).toMatchObject({
      status: 'NOT_YET',
      nextEligible: day('2026-11-10'),
    });
    const over = computeEligibility(
      {
        ...adult,
        denials: [
          {
            donationDate: new Date('2026-10-01T09:00:00Z'),
            denyReason: 'SEVEN_DAYS',
          },
        ],
      },
      TODAY
    );
    expect(over.status).toBe('ELIGIBLE');
  });

  it('uses the Zagreb day of a late-evening denial', () => {
    // 23:30 UTC on Oct 8 is already Oct 9 in Zagreb: blocked until Oct 16.
    const result = computeEligibility(
      {
        ...adult,
        denials: [
          {
            donationDate: new Date('2026-10-08T23:30:00Z'),
            denyReason: 'SEVEN_DAYS',
          },
        ],
      },
      day('2026-10-15')
    );
    expect(result.nextEligible).toEqual(day('2026-10-16'));
  });

  it('never lists permanently denied, LONGER-denied or inactive donors', () => {
    const at = (denyReason: string) =>
      computeEligibility(
        {
          ...adult,
          denials: [{ donationDate: day('2020-01-01'), denyReason }],
        },
        TODAY
      ).status;
    expect(at('PERMANENT')).toBe('PERMANENT');
    expect(at('LONGER')).toBe('MANUAL');
    expect(computeEligibility({ ...adult, active: false }, TODAY).status).toBe(
      'INACTIVE'
    );
  });

  it('applies the age limits', () => {
    expect(
      computeEligibility({ ...adult, dob: day('2008-11-01') }, TODAY)
    ).toMatchObject({ status: 'NOT_YET', nextEligible: day('2026-11-01') });
    expect(
      computeEligibility({ ...adult, dob: day('2008-10-16') }, TODAY).status
    ).toBe('ELIGIBLE');
    expect(
      computeEligibility({ ...adult, dob: day('1960-10-16') }, TODAY).status
    ).toBe('TOO_OLD');
    expect(
      computeEligibility({ ...adult, dob: day('1960-10-17') }, TODAY).status
    ).toBe('ELIGIBLE');
    // Turns 66 before the gap is over.
    expect(
      computeEligibility(
        { ...adult, dob: day('1960-11-01'), lastDonation: day('2026-09-01') },
        TODAY
      ).status
    ).toBe('TOO_OLD');
  });
});
