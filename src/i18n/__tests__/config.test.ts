import { describe, expect, it } from 'vitest';
import { isLocale, resolveLocale } from '@/i18n/config';

describe('resolveLocale', () => {
  it('falls back to English for null, undefined and empty input', () => {
    for (const value of [null, undefined, '']) {
      expect(resolveLocale(value, value)).toBe('en');
    }
  });

  it('uses the language the user picked', () => {
    expect(resolveLocale('hr', 'en-US,en;q=0.9')).toBe('hr');
    expect(resolveLocale('en', 'hr-HR,hr;q=0.9')).toBe('en');
  });

  it('ignores an unknown cookie value', () => {
    expect(resolveLocale('de', 'hr')).toBe('hr');
    expect(resolveLocale('de', null)).toBe('en');
  });

  it('takes the first supported browser language by preference', () => {
    expect(resolveLocale(null, 'hr-HR,hr;q=0.9,en;q=0.8')).toBe('hr');
    expect(resolveLocale(null, 'de-DE,de;q=0.9,hr;q=0.8,en;q=0.7')).toBe('hr');
    expect(resolveLocale(null, 'en;q=0.5,hr;q=0.9')).toBe('hr');
    expect(resolveLocale(null, 'de-DE,fr;q=0.8')).toBe('en');
    expect(resolveLocale(null, '*')).toBe('en');
    expect(resolveLocale(null, 'hr;q=0')).toBe('en');
  });
});

describe('isLocale', () => {
  it('accepts only supported languages', () => {
    expect(isLocale('hr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    for (const value of ['HR', 'de', '', null, undefined]) {
      expect(isLocale(value)).toBe(false);
    }
  });
});
