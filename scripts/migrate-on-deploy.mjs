// Applies pending Prisma migrations as the last step of a Vercel production
// build (the `vercel-build` script), so a deploy never runs code against an
// older database. It runs after `next build`, so a broken build leaves the
// database alone; a failed migration fails the deploy and the current one
// stays live. Migrations must therefore keep working with the code before
// them (add columns, don't rename or drop them in the same release).
//
// Preview deploys skip it: they may share the production database, and an
// unmerged branch must not change it.
//
//   node scripts/migrate-on-deploy.mjs

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// What to do for these environment variables: 'migrate', 'skip' (not a
// production deploy) or 'missing-url' (production without a database URL).
export function migrationPlan(env) {
  if (env?.VERCEL_ENV !== 'production') {
    return 'skip';
  }
  return env.POSTGRES_URL_NON_POOLING?.trim() ? 'migrate' : 'missing-url';
}

function main() {
  const plan = migrationPlan(process.env);
  if (plan === 'skip') {
    console.log(
      `Not a production deploy (VERCEL_ENV=${process.env.VERCEL_ENV || 'unset'}); skipping migrations.`
    );
    return 0;
  }
  if (plan === 'missing-url') {
    console.error(
      'POSTGRES_URL_NON_POOLING is not set, so migrations cannot run. Failing the deploy.'
    );
    return 1;
  }
  console.log('Applying database migrations...');
  const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.error('Migrations failed. Failing the deploy.');
    return 1;
  }
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
