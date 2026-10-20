import { faker } from '@faker-js/faker';
import {
  Action,
  BloodType,
  DenyReasonType,
  Donation,
  Donor,
  Gender,
  Place,
} from '../src/generated/prisma/client';
import { toAppDay } from '../src/lib/dates';

// Define types for the partial structures that will be generated
type GeneratedDonation = Omit<
  Donation,
  'createdAt' | 'updatedAt' | 'createdById'
>;
type GeneratedDonor = Omit<Donor, 'createdAt' | 'updatedAt'> & {
  donations: GeneratedDonation[];
};
type GeneratedAction = Omit<Action, 'createdAt' | 'updatedAt'> & {
  donors: GeneratedDonor[];
};
type GeneratedPlace = Omit<Place, 'createdAt' | 'updatedAt'> & {
  actions: GeneratedAction[];
};
export type SeedDataType = GeneratedPlace[];

// Helper function to generate a random enum value
function randomEnum<T extends Record<string, string>>(anEnum: T): T[keyof T] {
  const enumValues = Object.values(anEnum);
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex] as T[keyof T];
}

function dateOnly(date: Date): Date {
  return new Date(date.toISOString().split('T')[0]);
}

// Generate a single donation
function generateDonation(
  donorId: string,
  actionId: string,
  donationDate: Date
): GeneratedDonation {
  const denied = Math.random() < 0.15;
  return {
    id: faker.string.uuid(),
    denied,
    denyReason: denied ? randomEnum(DenyReasonType) : null,
    donationDate,
    note: faker.lorem.sentence(),
    donorId,
    actionId,
  };
}

// Generate a single donor whose donation belongs to the given action
function generateDonor(actionId: string, actionDate: Date): GeneratedDonor {
  const donorId = faker.string.uuid();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const donations = [generateDonation(donorId, actionId, actionDate)];
  return {
    id: donorId,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    fatherName: faker.person.firstName(),
    email: faker.internet.email({ firstName, lastName }),
    phone: faker.phone.number(),
    dob: dateOnly(faker.date.birthdate({ min: 18, max: 65, mode: 'age' })),
    oib: faker.string.numeric(11),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    gender: randomEnum(Gender),
    bloodType: randomEnum(BloodType),
    // Totals follow the app's rule: starting values plus successful donations.
    initialDonationCount: 0,
    initialLastDonation: null,
    donationCount: donations.filter((d) => !d.denied).length,
    lastDonation: donations.some((d) => !d.denied)
      ? toAppDay(actionDate)
      : null,
    active: true,
    note: null,
    donations,
  };
}

// Generate a single action with donors
function generateAction(placeId: string): GeneratedAction {
  const actionId = faker.string.uuid();
  const startDateTime =
    Math.random() > 0.5 ? faker.date.past() : faker.date.future();
  const endDateTime = new Date(
    startDateTime.getTime() +
      faker.number.int({ min: 1, max: 72 }) * 60 * 60 * 1000
  );
  // Only actions that already happened have donors and donations.
  const donors =
    startDateTime < new Date()
      ? Array.from({ length: 4 }, () => generateDonor(actionId, startDateTime))
      : [];

  return {
    id: actionId,
    title: faker.company.name(),
    startDateTime,
    endDateTime,
    donationCount: donors.filter((donor) =>
      donor.donations.some((d) => !d.denied)
    ).length,
    note: faker.lorem.sentence(),
    placeId,
    donors,
  };
}

// Generate a single place with actions
function generatePlace(): GeneratedPlace {
  const placeId = faker.string.uuid();
  return {
    id: placeId,
    title: faker.company.name(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    contactName: faker.person.fullName(),
    note: faker.lorem.sentence(),
    actions: Array.from({ length: 2 }, () => generateAction(placeId)),
  };
}

// Generate the entire seed data structure
export function generateSeedData(): SeedDataType {
  return Array.from({ length: 5 }, generatePlace);
}
