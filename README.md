# Blood Donations

App to track blood donations.

## Installation

Clone the repository, switch to Node 22 (with its bundled npm 10, the same as
CI) and install the dependencies. With nvm, `.nvmrc` selects the version:

```bash
nvm install
nvm use
npm install
```

Other npm versions write the lock file differently, which breaks `npm ci` in
CI.

## Environment Setup

Copy the .env.example file to a new file named .env and fill in the environment variables with your own settings.

## Database

Start a local Postgres with Docker (credentials match `.env.example`):

```bash
docker compose up -d
```

Generate prisma client (run on schema changes):

```bash
npx prisma generate
```

Run initial migration:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npx prisma db seed
```

The seed creates an admin user plus fake places and actions. On a local
database the admin defaults to `admin@admin.admin` / `AdminPassword123`; for any
other database set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, or the seed
refuses to run. It imports donors from a CSV file
if one exists at `prisma/donors.csv` or at the path in `DONORS_CSV`; without
one it creates fake donors and donations instead. The file contains real
personal data, so it is ignored by git and must never be committed.

Reset database (also seeds database):

```bash
npx prisma migrate reset
```

To interact with the database using a GUI, open Prisma Studio:

```bash
npx prisma studio
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Unit tests:

```bash
npm test
```

End-to-end smoke test against a running app with a freshly seeded local
database (it creates and deletes records, so never run it against production):

```bash
npm run build && npm start
node scripts/smoke-test.mjs http://localhost:3000
```

CI (`.github/workflows/ci.yml`) runs lint, type-check, unit tests, migrations
against Postgres, a schema drift check, the build and the smoke test on every
pull request.
