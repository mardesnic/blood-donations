import { describe, expect, it } from 'vitest';
import { ValidationError } from 'yup';
import { donorDataFromBody } from '../body';

const minimal = { firstName: 'Ana', lastName: 'Horvat', gender: 'FEMALE' };

describe('donorDataFromBody', () => {
  it('rejects null, undefined and empty bodies', () => {
    for (const body of [null, undefined, {}, '']) {
      expect(() => donorDataFromBody(body)).toThrow(ValidationError);
    }
  });

  it('requires first name, last name and a valid gender', () => {
    expect(() => donorDataFromBody({ ...minimal, firstName: '  ' })).toThrow(
      'firstName is required'
    );
    expect(() => donorDataFromBody({ ...minimal, gender: 'OTHER' })).toThrow(
      ValidationError
    );
  });

  it('fills defaults for a minimal donor', () => {
    expect(donorDataFromBody(minimal)).toEqual({
      firstName: 'Ana',
      lastName: 'Horvat',
      fullName: 'Ana Horvat',
      fatherName: null,
      email: '',
      phone: null,
      dob: null,
      oib: null,
      address: null,
      city: null,
      gender: 'FEMALE',
      bloodType: null,
      initialDonationCount: 0,
      initialLastDonation: null,
      active: true,
      note: null,
    });
  });

  it('keeps a multi-word last name', () => {
    expect(
      donorDataFromBody({
        ...minimal,
        firstName: 'Ana Marija',
        lastName: 'Horvat Kovač',
      }).fullName
    ).toBe('Ana Marija Horvat Kovač');
  });

  it('can make a donor inactive', () => {
    expect(donorDataFromBody({ ...minimal, active: false }).active).toBe(false);
  });

  it('stores calendar days without shifting them', () => {
    const data = donorDataFromBody({
      ...minimal,
      dob: '1990-05-01',
      initialLastDonation: '2025-12-31',
    });
    expect(data.dob).toEqual(new Date('1990-05-01T00:00:00.000Z'));
    expect(data.initialLastDonation).toEqual(
      new Date('2025-12-31T00:00:00.000Z')
    );
  });

  it('drops an unknown blood type and invalid counts', () => {
    const data = donorDataFromBody({
      ...minimal,
      bloodType: '',
      initialDonationCount: -3,
    });
    expect(data.bloodType).toBeNull();
    expect(data.initialDonationCount).toBe(0);
    expect(
      donorDataFromBody({
        ...minimal,
        bloodType: 'AB_NEGATIVE',
        initialDonationCount: '7',
      })
    ).toMatchObject({ bloodType: 'AB_NEGATIVE', initialDonationCount: 7 });
  });

  it('ignores fields the client may not write', () => {
    const data = donorDataFromBody({ ...minimal, id: 'x', donationCount: 99 });
    expect(data).not.toHaveProperty('id');
    expect(data).not.toHaveProperty('donationCount');
  });
});
