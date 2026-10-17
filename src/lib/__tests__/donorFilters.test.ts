import { describe, expect, it } from 'vitest';
import { buildDonorFilter, parseFilterString } from '@/lib/donorFilters';
import { generateFilterStringForItems } from '@/lib/utils';

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

describe('eligible filter', () => {
  it('turns the dropdown value into the eligibility query', () => {
    const filter = buildDonorFilter(
      generateFilterStringForItems({
        items: [{ field: 'eligible', operator: 'is', value: 'NOW' }],
      }),
      new Date('2026-10-16T00:00:00.000Z')
    );
    expect(filter.AND).toHaveLength(1);
    expect(JSON.stringify(filter)).toContain('"active":true');
  });

  it('ignores other values', () => {
    expect(buildDonorFilter(['eligible|is|LATER'])).toEqual({});
    expect(buildDonorFilter(['eligible|isAnyOf|NOW'])).toEqual({});
  });

  it('includes both days of a date range', () => {
    expect(
      buildDonorFilter([
        'lastDonation|onOrAfter|2026-01-01T00:00:00.000Z',
        'lastDonation|onOrBefore|2026-03-31T00:00:00.000Z',
      ])
    ).toEqual({
      AND: [
        { lastDonation: { gte: new Date('2026-01-01T00:00:00.000Z') } },
        { lastDonation: { lt: new Date('2026-04-01T00:00:00.000Z') } },
      ],
    });
  });

  it('turns an age range into birth dates', () => {
    const today = new Date('2026-10-16T00:00:00.000Z');
    // 18 or older: born on or before 16.10.2008. 65 or younger: not yet 66,
    // so born after 16.10.1960.
    expect(buildDonorFilter(['age|>=|18', 'age|<=|65'], today)).toEqual({
      AND: [
        { dob: { lte: new Date('2008-10-16T00:00:00.000Z') } },
        { dob: { gt: new Date('1960-10-16T00:00:00.000Z') } },
      ],
    });
  });

  it('counts a 29 February birthday like the eligibility rules', () => {
    // computeEligibility treats someone born 29.2.2008 as 18 on 28.2.2026.
    expect(
      buildDonorFilter(['age|>=|18'], new Date('2026-02-28T00:00:00.000Z'))
    ).toEqual({
      AND: [{ dob: { lte: new Date('2008-02-29T00:00:00.000Z') } }],
    });
  });

  it('ignores invalid ages and operators', () => {
    for (const filter of [
      'age|>=|-1',
      'age|>=|1.5',
      'age|>=|abc',
      'age|>=|151',
      'age|=|30',
    ]) {
      expect(buildDonorFilter([filter])).toEqual({});
    }
  });
});
