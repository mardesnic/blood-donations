# Blood Donations

App to track blood donations.

## Installation

Clone the repository and install the dependencies:

```bash
npm install
```

## Environment Setup

Copy the .env.example file to a new file named .env and fill in the environment variables with your own settings.

## Database

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
