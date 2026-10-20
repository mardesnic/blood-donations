import { Role } from '@/generated/prisma/browser';

// Roles of the people who run the app. A future donor role (mobile app) must
// not get into staff pages or APIs, so checks list these explicitly.
export const STAFF_ROLES: readonly Role[] = [Role.ADMIN, Role.VOLUNTEER];

export function isStaffRole(role: unknown): role is Role {
  return STAFF_ROLES.includes(role as Role);
}

export function isAdmin(user: { role?: unknown } | null | undefined): boolean {
  return user?.role === Role.ADMIN;
}

// A user as shown on what they recorded: their name, or their email when
// the name is empty; '' when unknown.
export function userName(
  user: { name?: string | null; email?: string | null } | null | undefined
): string {
  return user?.name?.trim() || user?.email || '';
}

// Emails are stored and looked up lower-cased and trimmed.
export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export const MIN_PASSWORD_LENGTH = 10;
// bcrypt only uses the first 72 bytes.
const MAX_PASSWORD_BYTES = 72;

export type PasswordProblem = 'TOO_SHORT' | 'TOO_LONG';

// Why a new password can't be used, or null when it can.
export function passwordProblem(
  password: string | null | undefined
): PasswordProblem | null {
  const value = password || '';
  if (value.length < MIN_PASSWORD_LENGTH) {
    return 'TOO_SHORT';
  }
  if (new TextEncoder().encode(value).length > MAX_PASSWORD_BYTES) {
    return 'TOO_LONG';
  }
  return null;
}

// Letters and digits that can't be mistaken for each other when read out
// over the phone (no 0/O, 1/l/I).
const TEMP_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TEMP_LENGTH = 12;

// A temporary password an admin passes on in person; the user has to
// replace it after signing in.
export function generateTempPassword(
  random: (bytes: Uint8Array) => Uint8Array = (bytes) =>
    crypto.getRandomValues(bytes)
): string {
  // Rejection sampling, so every character is equally likely.
  const limit = 256 - (256 % TEMP_ALPHABET.length);
  let password = '';
  while (password.length < TEMP_LENGTH) {
    for (const byte of random(new Uint8Array(TEMP_LENGTH))) {
      if (byte < limit && password.length < TEMP_LENGTH) {
        password += TEMP_ALPHABET[byte % TEMP_ALPHABET.length];
      }
    }
  }
  return password;
}
