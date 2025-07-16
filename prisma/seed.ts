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

async function seedFakerData() {
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
    }
  }

  console.log('✅ Faker data seeded');
}

async function main() {
  try {
    await seedAdmin();

    // Run CSV donors and faker data sequentially
    await seedDonorsFromCsv();

    await seedFakerData();

    console.log('🎉 All seeding complete!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
