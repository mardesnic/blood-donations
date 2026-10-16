import { describe, expect, it, vi } from 'vitest';
import { BloodType } from '@prisma/client';
import { mapBloodType } from '../csvSeed';

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
