import {
  BloodType,
  DenyReasonType,
  Gender,
  Prisma,
} from '@/generated/prisma/client';
import {
  addDays,
  addMonths,
  appDayStart,
  latestStartEndingBy,
  parseDay,
  toAppDay,
} from '@/lib/dates';
import { DENIAL_END, GAP_MONTHS, MAX_AGE, MIN_AGE } from '@/lib/eligibility';
import { parseFilterString } from '@/lib/donorFilterModel';

const DAY_MS = 24 * 60 * 60 * 1000;

const NUMBER_OPERATORS: Record<string, keyof Prisma.IntFilter> = {
  '=': 'equals',
  '>': 'gt',
  '<': 'lt',
  '>=': 'gte',
  '<=': 'lte',
};

type FieldType = 'enum' | 'boolean' | 'number' | 'date' | 'string';

// Fields the donors table can filter on, with the type that decides how the
// value is parsed. Anything else is ignored.
const DONOR_FILTER_FIELDS: Record<string, FieldType> = {
  bloodType: 'enum',
  gender: 'enum',
  active: 'boolean',
  donationCount: 'number',
  lastDonation: 'date',
  dob: 'date',
  city: 'string',
};

const ENUM_VALUES: Record<string, readonly string[]> = {
  bloodType: Object.values(BloodType),
  gender: Object.values(Gender),
};

const BOOLEAN_VALUES: Record<string, boolean> = {
  ACTIVE: true,
  INACTIVE: false,
};

// Shared with the client, which keeps filters in the URL in this format.
export { parseFilterString };

// Calendar dates are stored as UTC midnight, so a day filter covers
// [day 00:00 UTC, next day 00:00 UTC).
function dateCondition(
  operator: string,
  value: string
): Prisma.DateTimeNullableFilter | null {
  const day = parseDay(value);
  if (!day) {
    return null;
  }
  const nextDay = new Date(day.getTime() + DAY_MS);
  switch (operator) {
    case 'is':
      return { gte: day, lt: nextDay };
    // The two ends of a from-to range; both days are included.
    case 'onOrAfter':
      return { gte: day };
    case 'onOrBefore':
      return { lt: nextDay };
    case 'after':
      return { gte: nextDay };
    case 'before':
      return { lt: day };
    default:
      return null;
  }
}

function fieldCondition(
  field: string,
  operator: string,
  value: string
): Prisma.DonorWhereInput | null {
  switch (DONOR_FILTER_FIELDS[field]) {
    case 'enum': {
      const allowed = ENUM_VALUES[field];
      if (operator === 'isAnyOf') {
        const values = value.split(',').filter((v) => allowed.includes(v));
        return values.length ? { [field]: { in: values } } : null;
      }
      if (operator === 'is' && allowed.includes(value)) {
        return { [field]: { equals: value } };
      }
      return null;
    }
    case 'boolean': {
      if (operator !== 'is' || !(value in BOOLEAN_VALUES)) {
        return null;
      }
      return { [field]: { equals: BOOLEAN_VALUES[value] } };
    }
    case 'number': {
      const prismaOperator = NUMBER_OPERATORS[operator];
      const number = Number(value);
      if (!prismaOperator || !Number.isInteger(number)) {
        return null;
      }
      return { [field]: { [prismaOperator]: number } };
    }
    case 'date': {
      const condition = dateCondition(operator, value);
      return condition ? { [field]: condition } : null;
    }
    case 'string': {
      const text = value.trim();
      if ((operator !== 'equals' && operator !== 'contains') || !text) {
        return null;
      }
      return { [field]: { [operator]: text, mode: 'insensitive' } };
    }
    default:
      return null;
  }
}

// The last birth (or start) day whose `months` are over by today, with the
// same month arithmetic as computeEligibility.
function latestStartMonthsBefore(today: Date, months: number): Date {
  return latestStartEndingBy(
    today,
    (start) => addMonths(start, months),
    addMonths(today, -months)
  );
}

const MAX_FILTER_AGE = 150;

// Age in whole years as a date-of-birth condition. Donors without a date of
// birth never match.
function ageCondition(
  operator: string,
  value: string,
  today: Date
): Prisma.DonorWhereInput | null {
  const age = Number(value);
  if (!Number.isInteger(age) || age < 0 || age > MAX_FILTER_AGE) {
    return null;
  }
  switch (operator) {
    // At least `age`: that birthday has passed.
    case '>=':
      return { dob: { lte: latestStartMonthsBefore(today, age * 12) } };
    // At most `age`: the next birthday hasn't.
    case '<=':
      return { dob: { gt: latestStartMonthsBefore(today, (age + 1) * 12) } };
    default:
      return null;
  }
}

// The same rules as computeEligibility, as a query: active, aged 18-65, past
// the gap after the last donation and not blocked by a denial. Each "latest
// start" is the last day whose wait is over by today.
export function eligibleNowWhere(today: Date): Prisma.DonorWhereInput {
  const latestStart = (months: number) =>
    latestStartMonthsBefore(today, months);
  const denialBlocks = Object.entries(DENIAL_END).flatMap(([reason, end]) => {
    if (!end) {
      return [];
    }
    const lastOver = latestStartEndingBy(today, end, addMonths(today, -12));
    // A denial still blocks if it happened after lastOver.
    return [
      {
        donations: {
          none: {
            denied: true,
            denyReason: reason as DenyReasonType,
            donationDate: { gte: appDayStart(addDays(lastOver, 1)) },
          },
        },
      },
    ];
  });
  return {
    AND: [
      { active: true },
      {
        dob: {
          not: null,
          lte: latestStart(MIN_AGE * 12),
          gt: latestStart((MAX_AGE + 1) * 12),
        },
      },
      {
        OR: [
          { lastDonation: null },
          {
            gender: 'MALE',
            lastDonation: { lte: latestStart(GAP_MONTHS.MALE) },
          },
          {
            gender: 'FEMALE',
            lastDonation: { lte: latestStart(GAP_MONTHS.FEMALE) },
          },
        ],
      },
      {
        donations: {
          none: { denied: true, denyReason: { in: ['PERMANENT', 'LONGER'] } },
        },
      },
      ...denialBlocks,
    ],
  };
}

export function buildDonorFilter(
  filters: string[] | null | undefined,
  today: Date = toAppDay(new Date()) as Date
): Prisma.DonorWhereInput {
  const conditions = (filters || [])
    .map(parseFilterString)
    .map((parsed) => {
      if (!parsed) {
        return null;
      }
      if (parsed.field === 'age') {
        return ageCondition(parsed.operator, parsed.value, today);
      }
      if (parsed.field === 'eligible') {
        return parsed.operator === 'is' && parsed.value === 'NOW'
          ? eligibleNowWhere(today)
          : null;
      }
      return fieldCondition(parsed.field, parsed.operator, parsed.value);
    })
    .filter((condition): condition is Prisma.DonorWhereInput => !!condition);
  return conditions.length ? { AND: conditions } : {};
}
