import { BloodType, Gender, Prisma } from '@prisma/client';
import { parseDay } from '@/lib/dates';

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

// Parses "field|operator|value"; the value may itself contain "|".
export function parseFilterString(filter: string | null | undefined): {
  field: string;
  operator: string;
  value: string;
} | null {
  if (!filter) {
    return null;
  }
  const [field, operator, ...rest] = filter.split('|');
  const value = rest.join('|');
  if (!field || !operator || !value) {
    return null;
  }
  return { field, operator, value };
}

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

export function buildDonorFilter(
  filters: string[] | null | undefined
): Prisma.DonorWhereInput {
  const conditions = (filters || [])
    .map(parseFilterString)
    .map((parsed) =>
      parsed
        ? fieldCondition(parsed.field, parsed.operator, parsed.value)
        : null
    )
    .filter((condition): condition is Prisma.DonorWhereInput => !!condition);
  return conditions.length ? { AND: conditions } : {};
}
