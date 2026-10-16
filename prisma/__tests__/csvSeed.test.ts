import { describe, expect, it, vi } from 'vitest';
import { BloodType } from '../../src/generated/prisma/client';
import { mapBloodType, parseCroatianDate } from '../csvSeed';

describe('mapBloodType', () => {
  it('returns null for null, undefined and empty input', () => {
    expect(mapBloodType(null)).toBeNull();
    expect(mapBloodType(undefined)).toBeNull();
    expect(mapBloodType('')).toBeNull();
    expect(mapBloodType('   ')).toBeNull();
  });

  it('returns null for an unknown value instead of guessing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(mapBloodType('C+')).toBeNull();
  });

  it('maps the values used in the CSV, including 0 for O', () => {
    expect(mapBloodType('A+')).toBe(BloodType.A_POSITIVE);
    expect(mapBloodType('ab-')).toBe(BloodType.AB_NEGATIVE);
    expect(mapBloodType(' 0+ ')).toBe(BloodType.O_POSITIVE);
    expect(mapBloodType('0-')).toBe(BloodType.O_NEGATIVE);
  });
});

describe('parseCroatianDate', () => {
  it('returns null for null, undefined, empty and malformed input', () => {
    expect(parseCroatianDate(null)).toBeNull();
    expect(parseCroatianDate(undefined)).toBeNull();
    expect(parseCroatianDate('')).toBeNull();
    expect(parseCroatianDate('1990-05-01')).toBeNull();
  });

  it('parses D.M.YYYY. as UTC midnight', () => {
    expect(parseCroatianDate('1.5.1990.')).toEqual(
      new Date('1990-05-01T00:00:00.000Z')
    );
    expect(parseCroatianDate(' 31.12.2025 ')).toEqual(
      new Date('2025-12-31T00:00:00.000Z')
    );
  });
});
