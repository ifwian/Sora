# Database setup

PostgreSQL + Prisma 6. The schema is `prisma/schema.prisma`; the SQL history is in `prisma/migrations/` (5 migrations).

> The migrations were written by hand (the sandbox they were built in couldn't run the Prisma CLI) and checked two ways:
> applied from scratch to a real PostgreSQL 16, and compared column-by-column against `schema.prisma` (19 models, 157 columns,
> zero differences). The API test suite then ran against that database.

## 1. Get a database
Local Postgres (`createdb personal_os_dev`), or a free hosted one — Neon, Supabase, Railway.

## 2. Configure
```bash
cp .env.example .env     # then edit DATABASE_URL and JWT_SECRET
```
Generate a real secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## 3. Create the tables
```bash
npm install
npx prisma generate
npx prisma migrate dev
```
`migrate dev` applies the existing migrations. If it says the database is out of sync with the schema and offers to
create a new migration, accept it and commit the result — that just means Prisma's generated SQL differs cosmetically from the
hand-written SQL (index names, etc.).

## 4. Optional
```bash
npm run db:seed      # demo user: demo@personalos.dev / password123 (refuses to run in production)
npm run db:studio    # browse the data in a browser
```

## Running the tests
The API tests create users and data, so they **refuse to run unless the database name contains "test"**.
```bash
createdb personal_os_test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/personal_os_test npx prisma migrate deploy
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/personal_os_test npm test
```
(Adjust the user/password to match your install.) On Windows PowerShell set the variable first: `$env:DATABASE_URL="..."`.
