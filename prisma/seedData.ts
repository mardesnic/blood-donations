import { faker } from '@faker-js/faker';
import {
  Action,
  BloodType,
  Communication,
  CommunicationType,
  DenyReasonType,
  Donation,
  Donor,
  Gender,
  Place,
} from '@prisma/client';

// Define types for the partial structures that will be generated
type GeneratedCommunication = Omit<Communication, 'createdAt' | 'updatedAt'>;
type GeneratedDonation = Omit<Donation, 'createdAt' | 'updatedAt'>;
type GeneratedDonor = Omit<Donor, 'createdAt' | 'updatedAt'> & {
  donations: GeneratedDonation[];
  communications: GeneratedCommunication[];
};
type GeneratedAction = Omit<Action, 'createdAt' | 'updatedAt'> & {
  donors: GeneratedDonor[];
};
type GeneratedPlace = Omit<Place, 'createdAt' | 'updatedAt'> & {
  actions: GeneratedAction[];
};
export type SeedDataType = GeneratedPlace[];

// Helper function to generate a random enum value
function randomEnum<T extends Record<string, number | string>>(
  anEnum: T
): T[keyof T] {
  const enumValues = Object.values(anEnum);
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex] as T[keyof T];
}

// Generate a single communication
function generateCommunication(donorId: string): GeneratedCommunication {
  return {
    id: faker.string.uuid(),
    type: randomEnum(CommunicationType),
    note: faker.lorem.sentence(),
    donorId,
  };
}

// Generate a single donation
function generateDonation(
  donorId: string,
  actionId: string
): GeneratedDonation {
  const denied = faker.datatype.boolean();
  const denyReason = denied ? randomEnum(DenyReasonType) : null;
  return {
    id: faker.string.uuid(),
    denied,
    denyReason,
    donationDate: faker.date.recent(),
    note: faker.lorem.sentence(),
    donorId,
    actionId,
  };
}

// Generate a single donor with donations and communications
function generateDonor(actionId: string): GeneratedDonor {
  const donorId = faker.string.uuid();
  const dob = faker.date.past({ years: 30, refDate: new Date('2000-01-01') });
  dob.setHours(0, 0, 0, 0);
  const firstName = faker.person.firstName();
  const lastName = faker.person.firstName();
  return {
    id: donorId,
    firstName: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`,
    fatherName: faker.person.firstName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    dob,
    oib: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    gender: randomEnum(Gender),
    bloodType: randomEnum(BloodType),
    donationCount: faker.number.int({ min: 0, max: 100 }),
    lastDonation: faker.date.past({ years: 3, refDate: new Date() }),
    active: faker.datatype.boolean(),
    note: faker.lorem.sentence(),
    donations: Array.from({ length: 5 }, () =>
      generateDonation(donorId, actionId)
    ),
    communications: Array.from({ length: 3 }, () =>
      generateCommunication(donorId)
    ),
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

  return {
    id: actionId,
    title: faker.company.name(),
    startDateTime,
    endDateTime,
    donationCount: faker.number.int({ min: 0, max: 100 }),
    note: faker.lorem.sentence(),
    placeId,
    donors: Array.from({ length: 10 }, () => generateDonor(actionId)),
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
