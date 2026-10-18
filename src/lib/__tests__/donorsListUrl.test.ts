import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDonorsListUrl, rememberDonorsListUrl } from '@/lib/donorsListUrl';

const fakeStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
};

describe('donors list URL', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('falls back to the plain list without storage', () => {
    // The test environment has no window at all.
    expect(getDonorsListUrl()).toBe('/donors');
    expect(() => rememberDonorsListUrl('/donors?page=2')).not.toThrow();
  });

  it('ignores null, undefined, empty and other URLs', () => {
    vi.stubGlobal('window', { sessionStorage: fakeStorage() });
    for (const url of [
      null,
      undefined,
      '',
      '/actions',
      '/donors-evil',
      'https://example.com/donors',
    ]) {
      rememberDonorsListUrl(url);
      expect(getDonorsListUrl()).toBe('/donors');
    }
  });

  it('remembers the list with its filters', () => {
    vi.stubGlobal('window', { sessionStorage: fakeStorage() });
    rememberDonorsListUrl('/donors?filter=gender%7Cis%7CMALE&page=2');
    expect(getDonorsListUrl()).toBe('/donors?filter=gender%7Cis%7CMALE&page=2');
  });
});
