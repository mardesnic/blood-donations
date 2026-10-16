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

export interface Eligibility {
  status: EligibilityStatus;
  // The day the donor can donate again, when that day is known.
  nextEligible: Date | null;
  reason: string;
}

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
    return { status: 'INACTIVE', nextEligible: null, reason: 'Inactive' };
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
      reason: 'Permanently denied',
    };
  }

  const dob = asDate(donor.dob);
  if (!dob) {
    return {
      status: 'UNKNOWN_AGE',
      nextEligible: null,
      reason: 'Date of birth unknown',
    };
  }
  const ageLimit = addMonths(dob, (MAX_AGE + 1) * 12);
  if (ageLimit <= today) {
    return { status: 'TOO_OLD', nextEligible: null, reason: `Over ${MAX_AGE}` };
  }

  // A "LONGER" denial needs a decision; changing that denial's reason (for
  // example to the period that was decided) clears it.
  const longer = denials.find((d) => d.reason === 'LONGER');
  if (longer) {
    return {
      status: 'MANUAL',
      nextEligible: null,
      reason: `Denied for a longer period on ${formatDay(longer.day)} Check manually.`,
    };
  }

  const lastDonation = asDate(donor.lastDonation);

  // The latest of all the days the donor has to wait for.
  const waits: { until: Date; reason: string }[] = [
    {
      until: addMonths(dob, MIN_AGE * 12),
      reason: `turns ${MIN_AGE}`,
    },
  ];
  const gap = GAP_MONTHS[donor.gender as Gender];
  if (lastDonation && gap) {
    waits.push({
      until: addMonths(lastDonation, gap),
      reason: `${gap} months after the last donation`,
    });
  }
  for (const denial of denials) {
    const end = denial.reason ? DENIAL_END[denial.reason] : null;
    if (end) {
      waits.push({
        until: end(denial.day),
        reason: `denied on ${formatDay(denial.day)}`,
      });
    }
  }
  const latest = waits.reduce((a, b) => (b.until > a.until ? b : a));

  if (latest.until >= ageLimit) {
    return {
      status: 'TOO_OLD',
      nextEligible: null,
      reason: `Over ${MAX_AGE} by then`,
    };
  }
  if (latest.until <= today) {
    return {
      status: 'ELIGIBLE',
      nextEligible: latest.until,
      reason: 'Eligible now',
    };
  }
  return {
    status: 'NOT_YET',
    nextEligible: latest.until,
    reason: `Eligible from ${formatDay(latest.until)} (${latest.reason})`,
  };
}

// Short text for the table and export: the date, "Now" or why not.
export function eligibilityLabel(
  eligibility: Eligibility | null | undefined
): string {
  if (!eligibility) {
    return '';
  }
  switch (eligibility.status) {
    case 'ELIGIBLE':
      return 'Now';
    case 'NOT_YET':
      return formatDay(eligibility.nextEligible);
    case 'PERMANENT':
      return 'Never';
    case 'MANUAL':
      return 'Check manually';
    case 'TOO_OLD':
      return 'Over age limit';
    case 'UNKNOWN_AGE':
      return 'Unknown (no birth date)';
    case 'INACTIVE':
      return 'Inactive';
  }
}
