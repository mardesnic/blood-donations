import { describe, expect, it } from 'vitest';
import {
  actionSchema,
  donationSchema,
  parseBody,
  placeSchema,
} from '@/lib/schemas';

describe('parseBody', () => {
  it('rejects null, undefined and empty bodies', async () => {
    for (const body of [null, undefined, {}]) {
      await expect(parseBody(actionSchema, body)).rejects.toThrow();
      await expect(parseBody(donationSchema, body)).rejects.toThrow();
    }
  });

  it('strips fields the schema does not declare', async () => {
    const action = await parseBody(actionSchema, {
      id: 'attacker-chosen-id',
      donationCount: 999,
      title: ' Spring drive ',
      startDateTime: '2026-10-01T08:00:00.000Z',
      endDateTime: '2026-10-01T14:00:00.000Z',
    });
    expect(action).toEqual({
      title: 'Spring drive',
      placeId: null,
      startDateTime: new Date('2026-10-01T08:00:00.000Z'),
      endDateTime: new Date('2026-10-01T14:00:00.000Z'),
      note: null,
    });
  });

  it('turns empty relation ids into null', async () => {
    const donation = await parseBody(donationSchema, {
      donorId: 'donor-1',
      actionId: '',
      denyReason: '',
      donationDate: '2026-10-01T08:00:00.000Z',
    });
    expect(donation.actionId).toBeNull();
    expect(donation.denyReason).toBeNull();
    expect(donation.denied).toBe(false);
  });

  it('rejects an unknown deny reason', async () => {
    await expect(
      parseBody(donationSchema, {
        donorId: 'donor-1',
        denyReason: 'FOREVER',
        donationDate: '2026-10-01T08:00:00.000Z',
      })
    ).rejects.toThrow();
  });
});

describe('placeSchema', () => {
  it('rejects null, undefined and empty bodies', async () => {
    for (const body of [null, undefined, {}, { title: '   ' }]) {
      await expect(parseBody(placeSchema, body)).rejects.toThrow();
    }
  });

  it('stores empty optional fields as null and strips unknown fields', async () => {
    expect(
      await parseBody(placeSchema, {
        id: 'attacker-chosen-id',
        title: ' Town hall ',
        city: '',
        email: '',
      })
    ).toEqual({
      title: 'Town hall',
      address: null,
      city: null,
      phone: null,
      email: null,
      contactName: null,
      note: null,
    });
  });

  it('rejects an invalid email and text longer than the column', async () => {
    await expect(
      parseBody(placeSchema, { title: 'x', email: 'not-an-email' })
    ).rejects.toThrow();
    await expect(
      parseBody(placeSchema, { title: 'x'.repeat(101) })
    ).rejects.toThrow();
  });
});
