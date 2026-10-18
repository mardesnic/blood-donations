import { BLOOD_TYPES } from '@/lib/const';
import { addMonths, ageOn, parseDay, toAppDay, toDayString } from '@/lib/dates';
import { MonthTotals, percentOf } from '@/lib/overviewStats';

// A report period: whole calendar days in the app's time zone, both ends
// included, as UTC midnights (like stored calendar dates).
export interface ReportPeriod {
  from: Date;
  to: Date;
}

// Longest period a report covers, so a typo can't ask for centuries.
const MAX_YEARS = 10;

// The period from "YYYY-MM-DD" URL values; this calendar year by default.
// The ends are swapped if reversed, and the period is capped at MAX_YEARS.
export function parseReportPeriod(
  from: string | string[] | null | undefined,
  to: string | string[] | null | undefined,
  today: Date
): ReportPeriod {
  const first = (value: typeof from) =>
    parseDay(Array.isArray(value) ? value[0] : value);
  const year = today.getUTCFullYear();
  let start = first(from) ?? new Date(Date.UTC(year, 0, 1));
  let end = first(to) ?? new Date(Date.UTC(year, 11, 31));
  if (start > end) {
    [start, end] = [end, start];
  }
  const latestEnd = addMonths(start, MAX_YEARS * 12);
  return { from: start, to: end > latestEnd ? latestEnd : end };
}

// "YYYY-MM" for every month the period touches, oldest first.
export function periodMonths(period: ReportPeriod): string[] {
  const keys: string[] = [];
  let month = new Date(
    Date.UTC(period.from.getUTCFullYear(), period.from.getUTCMonth(), 1)
  );
  while (month <= period.to) {
    keys.push(toDayString(month).slice(0, 7));
    month = addMonths(month, 1);
  }
  return keys;
}

export interface ReportDonation {
  donationDate: Date;
  denied: boolean;
  denyReason: string | null;
  actionId: string | null;
  donor: {
    id: string;
    gender: string;
    bloodType: string | null;
    dob: Date | null;
    initialDonationCount: number;
  };
}

export interface ReportAction {
  id: string;
  title: string;
  place: string | null;
  startDateTime: Date;
  endDateTime: Date;
  // All of the action's donations, whatever their date.
  successful: number;
  denied: number;
}

export interface ReportInput {
  period: ReportPeriod;
  // The donations dated within the period.
  donations: ReportDonation[] | null | undefined;
  // Each donor's first successful donation ever recorded.
  firstDonations: Map<string, Date> | null | undefined;
  newDonors: number;
  // The actions that start within the period.
  actions: ReportAction[] | null | undefined;
}

export const AGE_GROUPS = [
  { key: '18-24', min: 18, max: 24 },
  { key: '25-34', min: 25, max: 34 },
  { key: '35-44', min: 35, max: 44 },
  { key: '45-54', min: 45, max: 54 },
  { key: '55-65', min: 55, max: 65 },
] as const;

const BLOOD_TYPE_ORDER = Object.keys(BLOOD_TYPES);

// Age group at the time of donating; "other" outside 18-65, "unknown"
// without a date of birth.
function ageGroup(dob: Date | null, day: Date | null): string {
  const age = day ? ageOn(dob, day) : null;
  if (age === null) {
    return 'unknown';
  }
  return AGE_GROUPS.find((g) => age >= g.min && age <= g.max)?.key ?? 'other';
}

// Everything the reports page and its CSV exports show for a period.
export function buildReport(input: ReportInput) {
  const donations = input.donations || [];
  const firstDonations = input.firstDonations || new Map<string, Date>();
  const successful = donations.filter((d) => !d.denied);
  const denied = donations.filter((d) => d.denied);
  const donorIds = new Set(successful.map((d) => d.donor.id));
  const inPeriod = (moment: Date | undefined) => {
    const day = toAppDay(moment ?? null);
    return !!day && day >= input.period.from && day <= input.period.to;
  };
  // First donation ever recorded falls in the period, and none were typed
  // in from before the records started.
  const firstTimeDonors = [...donorIds].filter((id) => {
    const donor = successful.find((d) => d.donor.id === id)?.donor;
    return !donor?.initialDonationCount && inPeriod(firstDonations.get(id));
  }).length;

  const months = new Map<string, MonthTotals>(
    periodMonths(input.period).map((month) => [
      month,
      { month, successful: 0, denied: 0 },
    ])
  );
  for (const d of donations) {
    const month = toDayString(toAppDay(d.donationDate)).slice(0, 7);
    const entry = months.get(month);
    if (entry) {
      entry[d.denied ? 'denied' : 'successful'] += 1;
    }
  }

  const count = <K>(keys: K[]) => {
    const counts = new Map<K, number>();
    for (const key of keys) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  };

  const bloodTypeCounts = count(successful.map((d) => d.donor.bloodType));
  const rank = (bloodType: string | null) =>
    bloodType === null
      ? BLOOD_TYPE_ORDER.length
      : BLOOD_TYPE_ORDER.indexOf(bloodType);

  const groups = [...AGE_GROUPS.map((g) => g.key), 'other', 'unknown'];
  const genderAge = groups.map((group) => {
    const inGroup = successful.filter(
      (d) => ageGroup(d.donor.dob, toAppDay(d.donationDate)) === group
    );
    return {
      group,
      male: inGroup.filter((d) => d.donor.gender === 'MALE').length,
      female: inGroup.filter((d) => d.donor.gender === 'FEMALE').length,
      total: inGroup.length,
    };
  });

  const withoutAction = donations.filter((d) => !d.actionId);

  return {
    totals: {
      successful: successful.length,
      denied: denied.length,
      attempts: donations.length,
      denialRate: percentOf(denied.length, donations.length),
      uniqueDonors: donorIds.size,
      firstTimeDonors,
      newDonors: input.newDonors,
      actions: (input.actions || []).length,
    },
    months: [...months.values()],
    actions: [...(input.actions || [])].sort(
      (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
    ),
    withoutAction: {
      successful: withoutAction.filter((d) => !d.denied).length,
      denied: withoutAction.filter((d) => d.denied).length,
    },
    bloodTypes: [...bloodTypeCounts]
      .map(([bloodType, total]) => ({ bloodType, count: total }))
      .sort((a, b) => rank(a.bloodType) - rank(b.bloodType)),
    // Groups without donations are left out, except the regular age groups.
    genderAge: genderAge.filter(
      (row) => row.total > 0 || AGE_GROUPS.some((g) => g.key === row.group)
    ),
    denyReasons: [...count(denied.map((d) => d.denyReason))]
      .map(([reason, total]) => ({ reason, count: total }))
      .sort((a, b) => b.count - a.count),
  };
}

export type Report = ReturnType<typeof buildReport>;
