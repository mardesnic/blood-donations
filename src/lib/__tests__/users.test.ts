import { describe, expect, it } from 'vitest';
import {
  generateTempPassword,
  isAdmin,
  isStaffRole,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  passwordProblem,
  userName,
} from '@/lib/users';

describe('isStaffRole and isAdmin', () => {
  it('accept only the staff roles', () => {
    expect(isStaffRole('ADMIN')).toBe(true);
    expect(isStaffRole('VOLUNTEER')).toBe(true);
    for (const value of ['DONOR', '', null, undefined]) {
      expect(isStaffRole(value)).toBe(false);
    }
  });

  it('isAdmin is false for null, undefined and other roles', () => {
    expect(isAdmin({ role: 'ADMIN' })).toBe(true);
    expect(isAdmin({ role: 'VOLUNTEER' })).toBe(false);
    expect(isAdmin({})).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe('normalizeEmail', () => {
  it('is empty for null, undefined, empty and non-strings', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
    expect(normalizeEmail('')).toBe('');
    expect(normalizeEmail(42)).toBe('');
  });

  it('trims and lower-cases', () => {
    expect(normalizeEmail('  Ana.Horvat@Example.COM ')).toBe(
      'ana.horvat@example.com'
    );
  });
});

describe('passwordProblem', () => {
  it('finds null, undefined and empty passwords too short', () => {
    expect(passwordProblem(null)).toBe('TOO_SHORT');
    expect(passwordProblem(undefined)).toBe('TOO_SHORT');
    expect(passwordProblem('')).toBe('TOO_SHORT');
    expect(passwordProblem('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
      'TOO_SHORT'
    );
  });

  it('accepts long enough passwords up to 72 bytes', () => {
    expect(passwordProblem('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull();
    expect(passwordProblem('a'.repeat(72))).toBeNull();
    expect(passwordProblem('a'.repeat(73))).toBe('TOO_LONG');
    // 37 two-byte letters are 74 bytes.
    expect(passwordProblem('č'.repeat(37))).toBe('TOO_LONG');
  });
});

describe('generateTempPassword', () => {
  it('makes 12 unambiguous characters that pass the password rules', () => {
    const password = generateTempPassword();
    expect(password).toMatch(/^[a-km-np-zA-HJ-NP-Z2-9]{12}$/);
    expect(passwordProblem(password)).toBeNull();
    expect(generateTempPassword()).not.toBe(password);
  });

  it('skips bytes that would make some characters more likely', () => {
    // 255 is above the last full round of the alphabet, so it is skipped.
    let call = 0;
    const password = generateTempPassword((bytes) => {
      call += 1;
      bytes.fill(call === 1 ? 255 : 0);
      return bytes;
    });
    expect(password).toBe('a'.repeat(12));
  });
});

describe('userName', () => {
  it('is empty for null, undefined and empty input', () => {
    expect(userName(null)).toBe('');
    expect(userName(undefined)).toBe('');
    expect(userName({})).toBe('');
    expect(userName({ name: ' ', email: null })).toBe('');
  });

  it('prefers the name, then the email', () => {
    expect(userName({ name: 'Ana', email: 'ana@example.com' })).toBe('Ana');
    expect(userName({ name: '', email: 'ana@example.com' })).toBe(
      'ana@example.com'
    );
  });
});
