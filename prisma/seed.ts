import { pathToFileURL } from 'url';
import bcrypt from 'bcrypt';
import { generateSeedData } from './seedData';
import { seedDonorsFromCsv } from './csvSeed';
import { prisma } from '../src/db';

// Local development and CI default; documented in the README.
const DEFAULT_ADMIN_EMAIL = 'admin@admin.admin';
const DEFAULT_ADMIN_PASSWORD = 'AdminPassword123';

export function isLocalDatabase(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  try {
    const { hostname } = new URL(url);
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}

// The default password is only allowed for a database on this machine, so a
// real environment can't end up with a publicly known admin login.
export function adminCredentials(env: Record<string, string | undefined>): {
  email: string;
  password: string;
} {
  const email = env.SEED_ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD || '';
  if (password) {
    return { email, password };
  }
  if (!isLocalDatabase(env.POSTGRES_PRISMA_URL)) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be set when seeding a database that is not on localhost.'
    );
  }
  return { email, password: DEFAULT_ADMIN_PASSWORD };
}

async function seedAdmin() {
  console.log('🌱 Seeding admin user...');
  const { email: adminEmail, password: adminPassword } = adminCredentials(
    process.env
  );
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

// Only seed when run as a script, not when imported by tests.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main();
}
