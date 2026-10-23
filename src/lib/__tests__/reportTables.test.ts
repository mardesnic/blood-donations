import { describe, expect, it } from 'vitest';
import { buildReport } from '@/lib/reports';
import { reportTables } from '@/lib/reportTables';

const day = (value: string) => new Date(`${value}T00:00:00.000Z`);
const PERIOD = { from: day('2026-01-01'), to: day('2026-12-31') };
const t = (key: string) => key;

const emptyFlags = (report: ReturnType<typeof buildReport>) =>
  Object.fromEntries(
    reportTables(report, t, 'hr').map((table) => [table.key, table.empty])
  );

describe('reportTables empty', () => {
  it('marks every table but the totals empty for a period without data', () => {
    for (const empty of [null, undefined, []]) {
      const report = buildReport({
        period: PERIOD,
        donations: empty,
        firstDonations: null,
        newDonors: 0,
        actions: empty,
        milestoneDonors: empty,
      });
      expect(emptyFlags(report)).toEqual({
        totals: false,
        months: true,
        actions: true,
        bloodTypes: true,
        genderAge: true,
        denyReasons: true,
        milestones: true,
      });
    }
  });

  it('keeps tables with data, and drives held without donations', () => {
    const report = buildReport({
      period: PERIOD,
      donations: [
        {
          donationDate: new Date('2026-03-10T09:00:00Z'),
          denied: false,
          denyReason: null,
          actionId: null,
          donor: {
            id: 'd1',
            gender: 'MALE',
            bloodType: 'O_POSITIVE',
            dob: day('1990-05-01'),
            initialDonationCount: 0,
          },
        },
      ],
      firstDonations: null,
      newDonors: 0,
      actions: [
        {
          id: 'a1',
          title: 'Akcija',
          place: null,
          startDateTime: new Date('2026-04-01T08:00:00Z'),
          endDateTime: new Date('2026-04-01T12:00:00Z'),
          successful: 0,
          denied: 0,
        },
      ],
    });
    expect(emptyFlags(report)).toMatchObject({
      months: false,
      actions: false,
      bloodTypes: false,
      genderAge: false,
      denyReasons: true,
    });
  });
});
