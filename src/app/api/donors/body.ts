import { BloodType, Gender } from '@prisma/client';
import { ValidationError } from 'yup';
import { parseDay } from '@/lib/dates';

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value: unknown): string | null {
  return text(value) || null;
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | null {
  return allowed.find((item) => item === value) ?? null;
}

// Builds the donor columns a client may write from a create/update body.
// donationCount and lastDonation are totals the app maintains, so the form
// edits the starting values (initialDonationCount, initialLastDonation).
export function donorDataFromBody(body: unknown) {
  const b = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    unknown
  >;
  const firstName = text(b.firstName);
  const lastName = text(b.lastName);
  const gender = oneOf(b.gender, Object.values(Gender));
  const errors = [
    !firstName && 'firstName is required',
    !lastName && 'lastName is required',
    !gender && 'gender must be MALE or FEMALE',
  ].filter((error): error is string => !!error);
  if (errors.length || !gender) {
    throw new ValidationError(errors.join(', '));
  }

  const initialCount = Number(b.initialDonationCount);
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    fatherName: optionalText(b.fatherName),
    email: text(b.email),
    phone: optionalText(b.phone),
    dob: parseDay(text(b.dob)),
    oib: optionalText(b.oib),
    address: optionalText(b.address),
    city: optionalText(b.city),
    gender,
    bloodType: oneOf(b.bloodType, Object.values(BloodType)),
    initialDonationCount:
      Number.isInteger(initialCount) && initialCount > 0 ? initialCount : 0,
    initialLastDonation: parseDay(text(b.initialLastDonation)),
    active: typeof b.active === 'boolean' ? b.active : true,
    note: optionalText(b.note),
  };
}
