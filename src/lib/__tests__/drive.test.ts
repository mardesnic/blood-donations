import { describe, expect, it } from 'vitest';
import { defaultDonationTime } from '@/lib/drive';

const at = (iso: string) => new Date(iso);

describe('defaultDonationTime', () => {
  const start = '2026-10-22T08:00:00.000Z';
  const end = '2026-10-22T14:00:00.000Z';

  it('uses now for null, undefined, empty and invalid action times', () => {
    const now = at('2026-10-19T10:00:00.000Z');
    for (const value of [null, undefined, '', 'soon']) {
      expect(defaultDonationTime(now, value, value)).toEqual(now);
    }
  });

  it('uses now while the action is on', () => {
    const now = at('2026-10-22T10:30:00.000Z');
    expect(defaultDonationTime(now, start, end)).toEqual(now);
  });

  it("uses the action's start when entering before or after it", () => {
    expect(
      defaultDonationTime(at('2026-10-21T10:00:00.000Z'), start, end)
    ).toEqual(at(start));
    expect(
      defaultDonationTime(at('2026-10-25T10:00:00.000Z'), start, end)
    ).toEqual(at(start));
    // Without an end, only the start moment counts as "on".
    expect(
      defaultDonationTime(at('2026-10-22T10:00:00.000Z'), start, null)
    ).toEqual(at(start));
  });
});
