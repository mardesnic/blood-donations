import { parseDay, toDayString } from '@/lib/dates';

// Why an existing donor may be the same person as the one being entered,
// strongest first.
export const DUPLICATE_REASONS = ['oib', 'nameDob', 'name'] as const;
export type DuplicateReason = (typeof DUPLICATE_REASONS)[number];

export interface DuplicateInput {
  firstName?: string | null;
  lastName?: string | null;
  // "YYYY-MM-DD" or a stored calendar date.
  dob?: string | Date | null;
  oib?: string | null;
}

export interface DuplicateCandidate {
  firstName: string;
  lastName: string;
  dob: Date | string | null;
  oib: string | null;
}

const norm = (value: string | null | undefined) =>
  (value || '').trim().toLocaleLowerCase('hr');

export const isOib = (value: string | null | undefined) =>
  /^\d{11}$/.test((value || '').trim());

const day = (value: string | Date | null | undefined) =>
  value instanceof Date
    ? toDayString(value)
    : parseDay(value)?.toISOString().slice(0, 10) || '';

// "oib": same OIB (one person). "nameDob": same name and date of birth.
// "name": same name while the new donor has no date of birth yet. Same name
// with a different date of birth is a different person.
export function duplicateReason(
  candidate: DuplicateCandidate | null | undefined,
  input: DuplicateInput | null | undefined
): DuplicateReason | null {
  if (!candidate || !input) {
    return null;
  }
  if (isOib(input.oib) && candidate.oib?.trim() === input.oib?.trim()) {
    return 'oib';
  }
  const sameName =
    !!norm(input.firstName) &&
    !!norm(input.lastName) &&
    norm(candidate.firstName) === norm(input.firstName) &&
    norm(candidate.lastName) === norm(input.lastName);
  if (!sameName) {
    return null;
  }
  const inputDay = day(input.dob ?? null);
  if (!inputDay) {
    return 'name';
  }
  return day(candidate.dob) === inputDay ? 'nameDob' : null;
}
