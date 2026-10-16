import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateSeedData } from './seedData';
import { seedDonorsFromCsv } from './csvSeed';

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('🌱 Seeding admin user...');
  const adminEmail = 'admin@admin.admin';
  const adminPassword = 'AdminPassword123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });
  console.log('✅ Admin user seeded');
}

// Fake donors are only added when no real donors were imported, so the two
// never mix in one database.
async function seedFakerData(withDonors: boolean) {
  console.log('🌱 Seeding faker-generated places, actions, donors...');

  const seedData = generateSeedData();

  for (const place of seedData) {
    const { actions, ...placeData } = place;

    const createdPlace = await prisma.place.create({
      data: {
        ...placeData,
        id: place.id,
      },
    });
    console.log(`🏢 Created place: ${createdPlace.title}`);

    for (const action of actions) {
      const { donors, ...actionData } = action;

      const createdAction = await prisma.action.create({
        data: {
          ...actionData,
          id: action.id,
          placeId: createdPlace.id,
        },
      });
      console.log(`📅 Created action: ${createdAction.title}`);

      if (!withDonors) continue;
      for (const { donations, ...donorData } of donors) {
        await prisma.donor.create({
          data: {
            ...donorData,
            donations: {
              create: donations.map(({ donorId, ...donation }) => donation),
            },
          },
        });
      }
    }
  }

  console.log('✅ Faker data seeded');
}

async function main() {
  try {
    await seedAdmin();

    // Run CSV donors and faker data sequentially
    const importedCsv = await seedDonorsFromCsv();

    await seedFakerData(!importedCsv);

    console.log('🎉 All seeding complete!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
