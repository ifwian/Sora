# Database setup

This project uses **PostgreSQL** + **Prisma**. The schema and initial
migration (`prisma/migrations/20260904120000_init/`) are already written
and have been verified by hand-applying the equivalent raw SQL against a
real local Postgres instance — but `prisma generate` / `prisma migrate`
themselves could not be run in the sandbox this was built in (it couldn't
reach Prisma's binary CDN), so you need to run them once yourself.

## 1. Get a Postgres database

Any of these work — pick whichever is easiest for you:

- **Local Postgres** — install it (`brew install postgresql` on Mac,
  or the Postgres.app installer, or your distro's package manager),
  then create a database: `createdb personal_os_dev`
- **Supabase** — free tier, gives you a connection string instantly
- **Neon** — free tier, serverless Postgres
- **Railway** — free trial, one-click Postgres

## 2. Configure the connection

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your database's connection string,
e.g.:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/personal_os_dev
```

## 3. Generate the client and apply the migration

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

`migrate dev` will see the `20260904120000_init` migration already in
`prisma/migrations/`, apply it, and generate the Prisma Client.

## 4. Seed some starter data (optional)

```bash
npm run db:seed
```

Creates a demo user (`demo@personalos.dev` / `password123`) with a few
tasks, notes, and events, mirroring the frontend's mock data.

## 5. Browse the data (optional)

```bash
npm run db:studio
```

Opens Prisma Studio, a GUI for browsing/editing rows in the browser.
