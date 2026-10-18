import { describe, expect, it } from 'vitest';
import {
  buildReport,
  parseReportPeriod,
  periodMonths,
  ReportDonation,
} from '@/lib/reports';

const day = (value: string) => new Date(`${value}T00:00:00.000Z`);
const TODAY = day('2026-10-18');

describe('parseReportPeriod', () => {
  it('defaults to this calendar year for null, undefined, empty and bad input', () => {
    for (const value of [null, undefined, '', 'yesterday', '2026-02-31']) {
      expect(parseReportPeriod(value, value, TODAY)).toEqual({
        from: day('2026-01-01'),
        to: day('2026-12-31'),
      });
    }
  });

  it('takes both ends, swaps reversed ones and caps the length', () => {
    expect(parseReportPeriod('2026-04-01', '2026-06-30', TODAY)).toEqual({
      from: day('2026-04-01'),
      to: day('2026-06-30'),
    });
    expect(parseReportPeriod('2026-06-30', '2026-04-01', TODAY)).toEqual({
      from: day('2026-04-01'),
      to: day('2026-06-30'),
    });
    expect(parseReportPeriod(['2025-01-01'], '2026-01-31', TODAY).from).toEqual(
      day('2025-01-01')
    );
    expect(parseReportPeriod('1900-01-01', '2026-01-01', TODAY).to).toEqual(
      day('1910-01-01')
    );
  });
});

describe('periodMonths', () => {
  it('lists every month the period touches', () => {
    expect(
      periodMonths({ from: day('2025-11-15'), to: day('2026-02-01') })
    ).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
    expect(
      periodMonths({ from: day('2026-03-31'), to: day('2026-03-31') })
    ).toEqual(['2026-03']);
  });
});

const donation = (
  overrides: Omit<Partial<ReportDonation>, 'donor'> & {
    donor?: Partial<ReportDonation['donor']>;
  }
): ReportDonation => ({
  donationDate: new Date('2026-03-10T09:00:00Z'),
  denied: false,
  denyReason: null,
  actionId: 'a1',
  ...overrides,
  donor: {
    id: 'd1',
    gender: 'MALE',
    bloodType: 'O_POSITIVE',
    dob: day('1990-05-01'),
    initialDonationCount: 0,
    ...overrides.donor,
  },
});

const PERIOD = { from: day('2026-01-01'), to: day('2026-12-31') };

describe('buildReport', () => {
  it('returns empty sections for null, undefined and empty input', () => {
    for (const empty of [null, undefined, []]) {
      const report = buildReport({
        period: PERIOD,
        donations: empty,
        firstDonations: empty === null ? null : undefined,
        newDonors: 0,
        actions: empty,
      });
      expect(report.totals).toEqual({
        successful: 0,
        denied: 0,
        attempts: 0,
        denialRate: null,
        uniqueDonors: 0,
        firstTimeDonors: 0,
        newDonors: 0,
        actions: 0,
      });
      expect(report.months).toHaveLength(12);
      expect(report.bloodTypes).toEqual([]);
      expect(report.denyReasons).toEqual([]);
      expect(report.genderAge.map((r) => r.group)).toEqual([
        '18-24',
        '25-34',
        '35-44',
        '45-54',
        '55-65',
      ]);
    }
  });

  it('counts totals, unique and first-time donors', () => {
    const report = buildReport({
      period: PERIOD,
      donations: [
        donation({ donor: { id: 'd1' } }),
        donation({ donor: { id: 'd1' }, donationDate: day('2026-07-01') }),
        // Donated before the records started: never first-time.
        donation({ donor: { id: 'd2', initialDonationCount: 3 } }),
        // First recorded donation was last year.
        donation({ donor: { id: 'd3' } }),
        donation({
          denied: true,
          denyReason: 'SEVEN_DAYS',
          donor: { id: 'd4' },
        }),
      ],
      firstDonations: new Map([
        ['d1', new Date('2026-03-10T09:00:00Z')],
        ['d2', new Date('2026-03-10T09:00:00Z')],
        ['d3', new Date('2025-06-01T09:00:00Z')],
      ]),
      newDonors: 2,
      actions: [],
    });
    expect(report.totals).toMatchObject({
      successful: 4,
      denied: 1,
      attempts: 5,
      denialRate: 20,
      uniqueDonors: 3,
      firstTimeDonors: 1,
      newDonors: 2,
    });
    expect(report.denyReasons).toEqual([{ reason: 'SEVEN_DAYS', count: 1 }]);
  });

  it('puts a donation late on 31 March in March, in Zagreb time', () => {
    const report = buildReport({
      period: PERIOD,
      // 21:30 UTC on 31 March is 23:30 in Zagreb (summer time).
      donations: [donation({ donationDate: new Date('2026-03-31T21:30:00Z') })],
      firstDonations: new Map(),
      newDonors: 0,
      actions: [],
    });
    expect(report.months.find((m) => m.month === '2026-03')?.successful).toBe(
      1
    );
    expect(report.months.find((m) => m.month === '2026-04')?.successful).toBe(
      0
    );
  });

  it('groups successful donations by blood type, gender and age at the time', () => {
    const report = buildReport({
      period: PERIOD,
      donations: [
        // 24 on the day of donating, 25 later that year.
        donation({
          donationDate: day('2026-03-01'),
          donor: {
            id: 'a',
            gender: 'FEMALE',
            dob: day('2001-06-01'),
            bloodType: 'A_NEGATIVE',
          },
        }),
        donation({ donor: { id: 'b', dob: null, bloodType: null } }),
        donation({ donor: { id: 'c', dob: day('1950-01-01') } }),
        donation({
          denied: true,
          donor: { id: 'e', bloodType: 'AB_POSITIVE' },
        }),
      ],
      firstDonations: new Map(),
      newDonors: 0,
      actions: [],
    });
    expect(report.bloodTypes).toEqual([
      { bloodType: 'A_NEGATIVE', count: 1 },
      { bloodType: 'O_POSITIVE', count: 1 },
      { bloodType: null, count: 1 },
    ]);
    const group = (key: string) =>
      report.genderAge.find((r) => r.group === key);
    expect(group('18-24')).toEqual({
      group: '18-24',
      male: 0,
      female: 1,
      total: 1,
    });
    expect(group('other')).toEqual({
      group: 'other',
      male: 1,
      female: 0,
      total: 1,
    });
    expect(group('unknown')).toEqual({
      group: 'unknown',
      male: 1,
      female: 0,
      total: 1,
    });
  });

  it('lists actions by date and counts donations without an action', () => {
    const report = buildReport({
      period: PERIOD,
      donations: [
        donation({ actionId: null }),
        donation({ actionId: null, denied: true }),
      ],
      firstDonations: new Map(),
      newDonors: 0,
      actions: [
        {
          id: 'late',
          title: 'B',
          place: null,
          startDateTime: day('2026-09-01'),
          endDateTime: day('2026-09-01'),
          successful: 3,
          denied: 0,
        },
        {
          id: 'early',
          title: 'A',
          place: 'Hall',
          startDateTime: day('2026-02-01'),
          endDateTime: day('2026-02-01'),
          successful: 1,
          denied: 1,
        },
      ],
    });
    expect(report.actions.map((a) => a.id)).toEqual(['early', 'late']);
    expect(report.totals.actions).toBe(2);
    expect(report.withoutAction).toEqual({ successful: 1, denied: 1 });
  });
});
