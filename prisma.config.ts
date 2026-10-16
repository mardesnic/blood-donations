import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Used by the Prisma CLI (migrate, db seed, studio). Migrations need the
// direct, non-pooled connection, which used to be `directUrl`.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Read directly instead of env(), which throws when the variable is unset:
  // `prisma generate` (run on npm install) doesn't need a database.
  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING ?? '',
  },
});
