import { describe, expect, it } from 'vitest';
import { AbstractIntlMessages, createTranslator } from 'next-intl';
import { DenyReasonType } from '@/generated/prisma/browser';
import { GENDERS, STATUSES } from '@/lib/const';
import {
  computeEligibility,
  eligibilityLabel,
  eligibilityReason,
  EligibilityInput,
  EligibilityTranslate,
} from '@/lib/eligibility';
import { Locale, LOCALES } from '@/i18n/config';
import en from '@/i18n/messages/en.json';
import hr from '@/i18n/messages/hr.json';

const MESSAGES: Record<Locale, AbstractIntlMessages> = { en, hr };

// A translator that takes keys built at runtime, as the app does.
const translator = (
  locale: Locale,
  namespace?: string
): EligibilityTranslate => {
  const t = createTranslator({ locale, messages: MESSAGES[locale] });
  return (key, values) =>
    t((namespace ? `${namespace}.${key}` : key) as never, values as never);
};

// Every key path in a messages file, e.g. "nav.donors".
function keys(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object'
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

describe('messages', () => {
  it('has the same keys in every language', () => {
    expect(keys(hr).sort()).toEqual(keys(en).sort());
  });

  it('has a name for every enum value the app shows', () => {
    for (const locale of LOCALES) {
      const t = translator(locale);
      // A missing message comes back as its key.
      const names = [
        ...Object.values(DenyReasonType).map((v) => `denyReasons.${v}`),
        ...GENDERS.map((v) => `genders.${v}`),
        ...GENDERS.map((v) => `gendersShort.${v}`),
        ...STATUSES.map((v) => `statuses.${v}`),
      ];
      for (const key of names) {
        expect(t(key)).not.toBe(key);
      }
    }
  });
});

describe('eligibility texts', () => {
  const day = (value: string) => new Date(`${value}T00:00:00.000Z`);
  const TODAY = day('2026-10-16');
  const adult: EligibilityInput = {
    gender: 'MALE',
    dob: day('1990-05-01'),
    active: true,
    lastDonation: null,
    denials: [],
  };
  const tFor = (locale: 'en' | 'hr') => translator(locale, 'eligibility');

  it('returns empty text for null, undefined and empty input', () => {
    const t = tFor('en');
    for (const value of [null, undefined]) {
      expect(eligibilityLabel(value, t)).toBe('');
      expect(eligibilityReason(value, t)).toBe('');
    }
    expect(
      eligibilityReason(
        {
          status: 'ELIGIBLE',
          nextEligible: null,
          reason: {} as never,
        },
        t
      )
    ).toBe('');
  });

  it('explains the wait in English and Croatian', () => {
    const waiting = computeEligibility(
      { ...adult, lastDonation: day('2026-08-01') },
      TODAY
    );
    expect(eligibilityLabel(waiting, tFor('en'))).toBe('01.11.2026.');
    expect(eligibilityReason(waiting, tFor('en'))).toBe(
      'Eligible from 01.11.2026. (3 months after the last donation)'
    );
    expect(eligibilityReason(waiting, tFor('hr'))).toBe(
      'Može darivati od 01.11.2026. (3 mjeseca nakon zadnjeg darivanja)'
    );

    const denied = computeEligibility(
      {
        ...adult,
        denials: [{ donationDate: day('2026-10-10'), denyReason: 'ONE_MONTH' }],
      },
      TODAY
    );
    expect(eligibilityReason(denied, tFor('hr'))).toBe(
      'Može darivati od 10.11.2026. (odbijen 10.10.2026.)'
    );
  });

  it('labels every status in both languages', () => {
    const cases: EligibilityInput[] = [
      adult,
      { ...adult, active: false },
      { ...adult, dob: null },
      { ...adult, dob: day('1950-01-01') },
      {
        ...adult,
        denials: [{ donationDate: day('2026-01-01'), denyReason: 'PERMANENT' }],
      },
      {
        ...adult,
        denials: [{ donationDate: day('2026-01-01'), denyReason: 'LONGER' }],
      },
      { ...adult, dob: day('2010-01-01') },
    ];
    for (const locale of LOCALES) {
      const t = tFor(locale);
      for (const input of cases) {
        const eligibility = computeEligibility(input, TODAY);
        expect(eligibilityLabel(eligibility, t)).not.toMatch(/eligibility\./);
        expect(eligibilityReason(eligibility, t)).not.toMatch(
          /eligibility\.|\{/
        );
      }
    }
    expect(eligibilityLabel(computeEligibility(adult, TODAY), tFor('hr'))).toBe(
      'Sada'
    );
  });
});
