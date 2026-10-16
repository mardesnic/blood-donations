import { describe, expect, it } from 'vitest';
import { buildDonorFilter, parseFilterString } from '@/lib/donorFilters';

describe('parseFilterString', () => {
  it('returns null for null, undefined, empty and incomplete input', () => {
    expect(parseFilterString(null)).toBeNull();
    expect(parseFilterString(undefined)).toBeNull();
    expect(parseFilterString('')).toBeNull();
    expect(parseFilterString('city|equals|')).toBeNull();
    expect(parseFilterString('city')).toBeNull();
  });

  it('keeps "|" inside the value', () => {
    expect(parseFilterString('city|equals|a|b')).toEqual({
      field: 'city',
      operator: 'equals',
      value: 'a|b',
    });
  });
});

describe('buildDonorFilter', () => {
  it('returns no condition for null, undefined and empty input', () => {
    expect(buildDonorFilter(null)).toEqual({});
    expect(buildDonorFilter(undefined)).toEqual({});
    expect(buildDonorFilter([])).toEqual({});
    expect(buildDonorFilter(['', 'gender|is|'])).toEqual({});
  });

  it('filters gender by exact value', () => {
    expect(buildDonorFilter(['gender|is|FEMALE'])).toEqual({
      AND: [{ gender: { equals: 'FEMALE' } }],
    });
  });

  it('filters status as a boolean', () => {
    expect(buildDonorFilter(['active|is|ACTIVE'])).toEqual({
      AND: [{ active: { equals: true } }],
    });
    expect(buildDonorFilter(['active|is|INACTIVE'])).toEqual({
      AND: [{ active: { equals: false } }],
    });
  });

  it('keeps only valid blood types', () => {
    expect(
      buildDonorFilter(['bloodType|isAnyOf|A_POSITIVE,NOPE,O_NEGATIVE'])
    ).toEqual({
      AND: [{ bloodType: { in: ['A_POSITIVE', 'O_NEGATIVE'] } }],
    });
    expect(buildDonorFilter(['bloodType|isAnyOf|NOPE'])).toEqual({});
  });

  it('matches a whole day for date filters', () => {
    expect(buildDonorFilter(['dob|is|1990-05-01T00:00:00.000Z'])).toEqual({
      AND: [
        {
          dob: {
            gte: new Date('1990-05-01T00:00:00.000Z'),
            lt: new Date('1990-05-02T00:00:00.000Z'),
          },
        },
      ],
    });
  });

  it('parses numbers and rejects non-integers', () => {
    expect(buildDonorFilter(['donationCount|>=|3'])).toEqual({
      AND: [{ donationCount: { gte: 3 } }],
    });
    expect(buildDonorFilter(['donationCount|=|abc'])).toEqual({});
  });

  it('matches text case-insensitively', () => {
    expect(buildDonorFilter(['city|equals| Split '])).toEqual({
      AND: [{ city: { equals: 'Split', mode: 'insensitive' } }],
    });
  });

  it('ignores unknown fields and operators', () => {
    expect(
      buildDonorFilter([
        'password|equals|x',
        'gender|isAnyOf|MALE',
        'dob|equals|1990-01-01',
      ])
    ).toEqual({ AND: [{ gender: { in: ['MALE'] } }] });
  });

  it('combines several filters', () => {
    expect(
      buildDonorFilter(['gender|is|MALE', 'active|is|ACTIVE']).AND
    ).toHaveLength(2);
  });
});
