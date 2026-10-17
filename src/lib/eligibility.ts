import { addDays, addMonths, formatDay, toAppDay } from './dates';

// Whole-blood donation rules:
// - after a successful donation: men wait 3 months, women 4;
// - a denied attempt blocks for its deny reason's period ("PERMANENT" for
//   good, "LONGER" until someone decides) and doesn't reset the gap;
// - donors must be 18-65 (until their 66th birthday);
// - inactive donors are never listed as eligible.
export const GAP_MONTHS = { MALE: 3, FEMALE: 4 } as const;
export const MIN_AGE = 18;
export const MAX_AGE = 65;

type Gender = keyof typeof GAP_MONTHS;
type DenyReason =
  | 'SEVEN_DAYS'
  | 'FIFTEEN_DAYS'
  | 'ONE_MONTH'
  | 'SIX_MONTHS'
  | 'ONE_YEAR'
  | 'LONGER'
  | 'PERMANENT';

// When a denial on `day` stops blocking; null for PERMANENT and LONGER.
export const DENIAL_END: Record<DenyReason, ((day: Date) => Date) | null> = {
  SEVEN_DAYS: (day) => addDays(day, 7),
  FIFTEEN_DAYS: (day) => addDays(day, 15),
  ONE_MONTH: (day) => addMonths(day, 1),
  SIX_MONTHS: (day) => addMonths(day, 6),
  ONE_YEAR: (day) => addMonths(day, 12),
  LONGER: null,
  PERMANENT: null,
};

export type EligibilityStatus =
  | 'ELIGIBLE'
  | 'NOT_YET'
  | 'PERMANENT'
  | 'MANUAL'
  | 'TOO_OLD'
  | 'UNKNOWN_AGE'
  | 'INACTIVE';

// Why the donor has that status, as a message key under "eligibility.reason"
// plus its values, so each page can show it in its own language.
export interface EligibilityReason {
  key:
    | 'inactive'
    | 'permanent'
    | 'unknownAge'
    | 'overAge'
    | 'overAgeByThen'
    | 'manual'
    | 'eligibleNow'
    | 'fromAge'
    | 'fromGap'
    | 'fromDenial';
  values?: Record<string, string | number>;
}

export interface Eligibility {
  status: EligibilityStatus;
  // The day the donor can donate again, when that day is known.
  nextEligible: Date | null;
  reason: EligibilityReason;
}

// A translation function for the "eligibility" messages.
export type EligibilityTranslate = (
  key: string,
  values?: Record<string, string | number>
) => string;

export interface EligibilityInput {
  gender: Gender | string;
  dob: Date | string | null;
  active: boolean;
  // Last successful donation day (the app's lastDonation total).
  lastDonation: Date | string | null;
  denials: { donationDate: Date | string; denyReason: string | null }[];
}

const asDate = (value: Date | string | null | undefined) =>
  value ? new Date(value) : null;

export function computeEligibility(
  donor: EligibilityInput,
  today: Date
): Eligibility {
  if (!donor.active) {
    return {
      status: 'INACTIVE',
      nextEligible: null,
      reason: { key: 'inactive' },
    };
  }

  const denials = donor.denials
    .map((d) => ({
      day: toAppDay(asDate(d.donationDate)),
      reason: d.denyReason as DenyReason | null,
    }))
    .filter((d): d is { day: Date; reason: DenyReason | null } => !!d.day);

  if (denials.some((d) => d.reason === 'PERMANENT')) {
    return {
      status: 'PERMANENT',
      nextEligible: null,
      reason: { key: 'permanent' },
    };
  }

  const dob = asDate(donor.dob);
  if (!dob) {
    return {
      status: 'UNKNOWN_AGE',
      nextEligible: null,
      reason: { key: 'unknownAge' },
    };
  }
  const ageLimit = addMonths(dob, (MAX_AGE + 1) * 12);
  if (ageLimit <= today) {
    return {
      status: 'TOO_OLD',
      nextEligible: null,
      reason: { key: 'overAge', values: { age: MAX_AGE } },
    };
  }

  // A "LONGER" denial needs a decision; changing that denial's reason (for
  // example to the period that was decided) clears it.
  const longer = denials.find((d) => d.reason === 'LONGER');
  if (longer) {
    return {
      status: 'MANUAL',
      nextEligible: null,
      reason: { key: 'manual', values: { date: formatDay(longer.day) } },
    };
  }

  const lastDonation = asDate(donor.lastDonation);

  // The latest of all the days the donor has to wait for.
  // Each reason's values get the date filled in once the latest is known.
  const waits: { until: Date; reason: EligibilityReason }[] = [
    {
      until: addMonths(dob, MIN_AGE * 12),
      reason: { key: 'fromAge', values: { age: MIN_AGE } },
    },
  ];
  const gap = GAP_MONTHS[donor.gender as Gender];
  if (lastDonation && gap) {
    waits.push({
      until: addMonths(lastDonation, gap),
      reason: { key: 'fromGap', values: { months: gap } },
    });
  }
  for (const denial of denials) {
    const end = denial.reason ? DENIAL_END[denial.reason] : null;
    if (end) {
      waits.push({
        until: end(denial.day),
        reason: {
          key: 'fromDenial',
          values: { deniedOn: formatDay(denial.day) },
        },
      });
    }
  }
  const latest = waits.reduce((a, b) => (b.until > a.until ? b : a));

  if (latest.until >= ageLimit) {
    return {
      status: 'TOO_OLD',
      nextEligible: null,
      reason: { key: 'overAgeByThen', values: { age: MAX_AGE } },
    };
  }
  if (latest.until <= today) {
    return {
      status: 'ELIGIBLE',
      nextEligible: latest.until,
      reason: { key: 'eligibleNow' },
    };
  }
  return {
    status: 'NOT_YET',
    nextEligible: latest.until,
    reason: {
      key: latest.reason.key,
      values: { ...latest.reason.values, date: formatDay(latest.until) },
    },
  };
}

// Short text for the table and export: the date, "Now" or why not.
export function eligibilityLabel(
  eligibility: Eligibility | null | undefined,
  t: EligibilityTranslate
): string {
  if (!eligibility) {
    return '';
  }
  if (eligibility.status === 'NOT_YET') {
    return formatDay(eligibility.nextEligible);
  }
  return t(`label.${eligibility.status}`);
}

// The full explanation, shown as the table's tooltip.
export function eligibilityReason(
  eligibility: Eligibility | null | undefined,
  t: EligibilityTranslate
): string {
  if (!eligibility?.reason?.key) {
    return '';
  }
  return t(`reason.${eligibility.reason.key}`, eligibility.reason.values);
}
