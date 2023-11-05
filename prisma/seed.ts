import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateSeedData, SeedDataType } from './seedData';

const prisma = new PrismaClient();

async function main() {
  // Seed the admin user
  const adminEmail = 'admin@admin.admin';
  const adminPassword = 'AdminPassword123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Seed a User
  const adminData = {
    email: adminEmail,
    password: hashedPassword,
  };

  await prisma.user.upsert({
    where: { email: adminData.email },
    update: {},
    create: adminData,
  });

  // Iterate over the seed data to create places, actions, donors, donations, and communications
  const seedData = generateSeedData();
  for (const place of seedData) {
    const { actions, ...placeData } = place;
    await prisma.place.create({ data: placeData });

    for (const action of place.actions) {
      const { donors, ...actionData } = action;
      await prisma.action.create({
        data: {
          ...actionData,
          placeId: place.id,
        },
      });

      for (const donor of action.donors) {
        const { communications, donations, ...donorData } = donor;
        await prisma.donor.create({
          data: donorData,
        });

        for (const donation of donor.donations) {
          await prisma.donation.create({
            data: {
              ...donation,
              donorId: donor.id,
              actionId: action.id,
            },
          });
        }

        for (const communication of donor.communications) {
          await prisma.communication.create({
            data: {
              ...communication,
              donorId: donor.id,
            },
          });
        }
      }
    }
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
