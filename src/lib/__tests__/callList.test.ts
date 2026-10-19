import { describe, expect, it } from 'vitest';
import {
  callListToSearchParams,
  contactedSince,
  DEFAULT_HIDE_CONTACTED_DAYS,
  formatContactDay,
  isContactType,
  parseCallListQuery,
} from '@/lib/callList';

const DEFAULTS = {
  bloodTypes: [],
  city: '',
  hideContactedDays: DEFAULT_HIDE_CONTACTED_DAYS,
};

describe('parseCallListQuery', () => {
  it('returns the defaults for null, undefined and empty input', () => {
    expect(parseCallListQuery(null)).toEqual(DEFAULTS);
    expect(parseCallListQuery(undefined)).toEqual(DEFAULTS);
    expect(parseCallListQuery({})).toEqual(DEFAULTS);
    expect(parseCallListQuery(new URLSearchParams())).toEqual(DEFAULTS);
    expect(
      parseCallListQuery({ bloodType: '', city: '', hideContacted: '' })
    ).toEqual(DEFAULTS);
  });

  it('keeps known blood types once and trims the city', () => {
    expect(
      parseCallListQuery(
        new URLSearchParams(
          'bloodType=A_POSITIVE,NOPE,O_NEGATIVE,A_POSITIVE&city=%20Zagreb%20&hideContacted=0'
        )
      )
    ).toEqual({
      bloodTypes: ['A_POSITIVE', 'O_NEGATIVE'],
      city: 'Zagreb',
      hideContactedDays: 0,
    });
  });

  it('takes the first of repeated values and ignores days not offered', () => {
    expect(
      parseCallListQuery({
        bloodType: ['AB_NEGATIVE', 'A_POSITIVE'],
        hideContacted: '5',
      })
    ).toEqual({ ...DEFAULTS, bloodTypes: ['AB_NEGATIVE'] });
    expect(parseCallListQuery({ hideContacted: '7' }).hideContactedDays).toBe(
      7
    );
  });
});

describe('callListToSearchParams', () => {
  it('is empty for null, undefined, empty and default input', () => {
    expect(callListToSearchParams(null).toString()).toBe('');
    expect(callListToSearchParams(undefined).toString()).toBe('');
    expect(callListToSearchParams({}).toString()).toBe('');
    expect(callListToSearchParams(DEFAULTS).toString()).toBe('');
  });

  it('round-trips through parseCallListQuery', () => {
    const query = {
      bloodTypes: ['O_NEGATIVE', 'B_POSITIVE'] as const,
      city: 'Velika Gorica',
      hideContactedDays: 0,
    };
    const params = callListToSearchParams({
      ...query,
      bloodTypes: [...query.bloodTypes],
    });
    expect(parseCallListQuery(params)).toEqual({
      ...query,
      bloodTypes: [...query.bloodTypes],
    });
  });
});

describe('contactedSince', () => {
  it('hides nobody for 0 days', () => {
    expect(contactedSince(0, new Date('2026-10-19T00:00:00.000Z'))).toBeNull();
  });

  it('starts at midnight in Zagreb, N days back', () => {
    // 19 September 2026 starts at 22:00 UTC the day before (summer time).
    expect(contactedSince(30, new Date('2026-10-19T00:00:00.000Z'))).toEqual(
      new Date('2026-09-18T22:00:00.000Z')
    );
  });
});

describe('isContactType', () => {
  it('accepts calls, SMS and e-mails only', () => {
    expect(isContactType('CALL')).toBe(true);
    expect(isContactType('EMAIL')).toBe(true);
    expect(isContactType('PUSH')).toBe(false);
    expect(isContactType(null)).toBe(false);
    expect(isContactType(undefined)).toBe(false);
    expect(isContactType('')).toBe(false);
  });
});

describe('formatContactDay', () => {
  it('is empty for null, undefined, empty and invalid input', () => {
    expect(formatContactDay(null)).toBe('');
    expect(formatContactDay(undefined)).toBe('');
    expect(formatContactDay('')).toBe('');
    expect(formatContactDay('nope')).toBe('');
  });

  it('uses the day in Zagreb', () => {
    // 23:30 in Zagreb on 18 October.
    expect(formatContactDay('2026-10-18T21:30:00.000Z')).toBe('18.10.2026.');
    expect(formatContactDay(new Date('2026-10-18T22:30:00.000Z'))).toBe(
      '19.10.2026.'
    );
  });
});
