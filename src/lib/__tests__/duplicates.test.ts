import { describe, expect, it } from 'vitest';
import { duplicateReason, isOib } from '@/lib/duplicates';
import { duplicatesBlockSaving } from '@/hooks/useDuplicateDonors';

const ana = {
  firstName: 'Ana',
  lastName: 'Horvat',
  dob: new Date('1990-05-01T00:00:00.000Z'),
  oib: '12345678903',
};

describe('duplicateReason', () => {
  it('returns null for null, undefined and empty input', () => {
    for (const empty of [null, undefined]) {
      expect(duplicateReason(empty, { firstName: 'Ana' })).toBeNull();
      expect(duplicateReason(ana, empty)).toBeNull();
    }
    expect(duplicateReason(ana, {})).toBeNull();
    expect(
      duplicateReason(ana, { firstName: '', lastName: '', oib: '' })
    ).toBeNull();
  });

  it('matches the same OIB, whatever the name', () => {
    expect(
      duplicateReason(ana, { firstName: 'Marko', oib: '12345678903' })
    ).toBe('oib');
    // Not a full OIB yet: no match on it.
    expect(duplicateReason(ana, { oib: '1234' })).toBeNull();
  });

  it('matches the same name and date of birth, ignoring case and spaces', () => {
    expect(
      duplicateReason(ana, {
        firstName: ' ANA ',
        lastName: 'horvat',
        dob: '1990-05-01',
      })
    ).toBe('nameDob');
  });

  it('only notes the same name when no date of birth is given', () => {
    expect(duplicateReason(ana, { firstName: 'Ana', lastName: 'Horvat' })).toBe(
      'name'
    );
    expect(
      duplicateReason(ana, { firstName: 'Ana', lastName: 'Horvat', dob: '' })
    ).toBe('name');
  });

  it('treats the same name with another date of birth as a different person', () => {
    expect(
      duplicateReason(ana, {
        firstName: 'Ana',
        lastName: 'Horvat',
        dob: '1991-05-01',
      })
    ).toBeNull();
    expect(
      duplicateReason(ana, { firstName: 'Ana', lastName: 'Kovač' })
    ).toBeNull();
  });
});

describe('isOib', () => {
  it('accepts exactly 11 digits', () => {
    expect(isOib('12345678903')).toBe(true);
    for (const value of [null, undefined, '', '1234567890', '1234567890a']) {
      expect(isOib(value)).toBe(false);
    }
  });
});

describe('duplicatesBlockSaving', () => {
  const match = (reason: 'oib' | 'nameDob' | 'name') => ({
    donor: {} as never,
    reason,
  });

  it('never blocks for null, undefined and no matches', () => {
    for (const empty of [null, undefined, []]) {
      expect(duplicatesBlockSaving(empty, false)).toBe(false);
    }
  });

  it('blocks the same OIB always, the same name and birthday until confirmed', () => {
    expect(duplicatesBlockSaving([match('oib')], true)).toBe(true);
    expect(duplicatesBlockSaving([match('nameDob')], false)).toBe(true);
    expect(duplicatesBlockSaving([match('nameDob')], true)).toBe(false);
    expect(duplicatesBlockSaving([match('name')], false)).toBe(false);
  });
});
