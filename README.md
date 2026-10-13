# Personal OS

A private, full-stack command center for your life — tasks, notes, calendar, habits, goals, study, money, entertainment, memories and an AI assistant, all in one calm, minimalist app with light and dark themes.

Built as a long-term learning and portfolio project: production-style engineering (auth, validation, migrations, tests, CI, security review) without over-engineering.

> **Principle:** when you open the app you should immediately understand what's happening in your life and what deserves your attention.

---

## Features

| Area | What it does |
|---|---|
| **Dashboard** | Time-aware greeting; today's tasks, upcoming events, habits, goals, recent notes, study deadlines and this month's spending at a glance. |
| **Tasks** | Priority, status, due date/time, category, tags, recurrence flag; Today / Upcoming / Completed / All views; search, filter, sort. |
| **Notes** | Tags, pin, archive, full-text search. |
| **Calendar** | Month / week / day views; events with time, location, category. Task deadlines appear automatically. |
| **Habits** | One-tap daily check-off, streaks, 7-day strip, weekly and monthly completion rates. |
| **Goals** | Milestone checklists with live progress and deadlines. |
| **Study** | Subjects, assignments & exams, study sessions, grades; overview with current grade, next deadlines and weekly study time. |
| **Finance** | Expenses by category, monthly budget with warnings, category breakdown, 6-month trend. |
| **Library** | Games, books (with page progress) and movies/series, each with status tabs and star ratings. |
| **Memories & Places** | A month-grouped timeline of moments (with tags and photo links) and a log of places visited. |
| **Global search** | One search box across every module; results grouped by type; fully keyboard-operable. |
| **Notifications** | In-app reminders for overdue and due-today tasks, today/tomorrow events, study deadlines, goals, open habits and budget limits — dismissals reset daily. |
| **Analytics** | 7 / 30 / 90-day view of tasks completed, study hours, habit rate and spending, plus all-time totals. |
| **AI assistant** | A *read-only* chat grounded in your own data ("What should I focus on today?"). Notes, memories and places are never shared with it. |
| **Accounts** | Register / login, protected routes, change password, per-user data isolation. |

Design: restrained neutral palette with a single teal accent, self-hosted Manrope font, hairline borders instead of shadows, WCAG-AA contrast verified by automated tests in both themes, keyboard navigation, skip link, reduced-motion support, responsive down to phones (bottom navigation + drawer).

## Screenshots

_Screenshots aren't included yet — run the app and add your own to `docs/screenshots/`. Good shots: dashboard (light + dark), tasks, calendar month view, habits, finance overview, assistant._

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, JavaScript, Tailwind CSS v4, React Router, Framer Motion (LazyMotion), lucide-react |
| Backend | Node.js 22, Express 5, REST API, zod validation |
| Database | PostgreSQL, Prisma 6 |
| Auth | JWT (HS256, pinned), bcrypt |
| AI | Anthropic API (optional) |
| Quality | Node's built-in test runner (116 tests), oxlint, GitHub Actions CI |
| Hosting (suggested) | Vercel (frontend), Render or Railway (API), Neon or Supabase (database) |

## Architecture

```
personal-os/
├── client/                      React app
│   ├── public/                  theme-init.js (runs before first paint)
│   ├── tests/                   contrast, notification rules, analytics, chat history
│   └── src/
│       ├── components/          common/ (design system), layout/, + one folder per feature
│       ├── pages/               one per route; lazy-loaded
│       ├── context/ + hooks/    data providers (tasks, notes, ...) and their hooks
│       ├── services/            all HTTP calls — components never call fetch directly
│       └── utils/               pure logic (dates, streaks, analytics, notification rules)
│
├── server/                      Express API
│   ├── prisma/                  schema.prisma, migrations/, seed.js
│   ├── tests/                   security unit tests + API tests (api/)
│   └── src/
│       ├── routes/              URL -> controller wiring
│       ├── controllers/         request handling
│       ├── validators/          zod schemas
│       ├── middleware/          requireAuth, validate, rate limits, error handler
│       ├── services/            assistantContext (what the AI may see)
│       └── utils/               crud.js (generic user-scoped CRUD), jwt, errors
│
├── .github/workflows/ci.yml     lint + tests + build on every push
├── render.yaml                  API deployment blueprint
└── DEPLOYMENT.md, SECURITY.md   step-by-step deploy guide, security review
```

**How a request flows:** component -> `services/*` (adds the auth header) -> Express route -> `requireAuth` (sets `req.userId`) -> `validateBody` (zod; unknown fields are stripped) -> controller -> Prisma, **always filtered by `userId`** -> `{ success, data }`.

**Design decisions worth knowing**
- Every data query is scoped by `userId`, and the tests prove another user gets `404`/empty on every route.
- Study, Finance, Library, Memories and Places share one generic CRUD router (`utils/crud.js`) and one config-driven UI (`ResourcePanel` + `FieldsForm`) instead of nine copies of the same code.
- Notifications and analytics are computed on the client from data already loaded, so "today" always follows *your* timezone.
- Server-controlled fields: a task's `completedAt` is set by the API, so completion stats can't be forged or skewed by edits.
- Library data and Memories/Places data only load when you visit those pages.

## Getting started

Prerequisites: Node.js 22+, PostgreSQL 14+.

```bash
# 1. Backend
cd server
npm install
cp .env.example .env          # Windows: copy .env.example .env   -- then edit it
npx prisma generate
npx prisma migrate dev        # creates the tables  (see server/DATABASE.md)
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173 and create an account. Optionally `npm run db:seed` (in `server/`) adds a demo user.

### Environment variables

**`server/.env`**

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | Random, 32+ characters in production (the server refuses to start otherwise) |
| `JWT_EXPIRES_IN` | no | Default `7d` |
| `CLIENT_ORIGIN` | no | Frontend URL for CORS. Default `http://localhost:5173`. No trailing slash |
| `PORT` | no | Default `5000` |
| `TRUST_PROXY` | production | Set `1` behind Render/Railway so rate limiting sees real visitor IPs |
| `ANTHROPIC_API_KEY` | no | Enables the Assistant. Without it the page explains how to enable it |
| `ANTHROPIC_MODEL` | no | Default `claude-sonnet-5-5` |

**`client/.env`** — `VITE_API_URL` (default `http://localhost:5000/api`).

### Using the AI assistant
Get an API key at console.anthropic.com, put it in `server/.env` as `ANTHROPIC_API_KEY`, restart the server. Each message costs a small amount; the server limits each user to 40 messages per 15 minutes.

## Testing

```bash
cd client && npm test      # contrast, notification rules, analytics, chat history (62 tests)
cd server && npm test      # security + API tests (54 tests) -- needs a *test* database
```
The API tests create users and data, so they refuse to run unless the database name contains "test". Setup is in [`server/DATABASE.md`](server/DATABASE.md). CI runs everything on every push against a throwaway Postgres.

## API overview

All responses are `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`. Everything except `/health` and `/auth/register|login` needs `Authorization: Bearer <token>`. All paths are under `/api`.

| Resource | Endpoints |
|---|---|
| Health | `GET /health` |
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `PATCH /auth/change-password` |
| Tasks · Notes · Events | `GET /` · `POST /` · `PATCH /:id` · `DELETE /:id` under `/tasks`, `/notes`, `/events` |
| Habits | CRUD under `/habits` · `POST /habits/:id/toggle` `{ date }` |
| Goals | CRUD under `/goals` · `POST /goals/:id/milestones` · `PATCH`/`DELETE /goals/:goalId/milestones/:milestoneId` |
| Study | CRUD under `/study/subjects`, `/study/assignments`, `/study/sessions`, `/study/grades` |
| Finance | CRUD under `/finance/expenses`, `/finance/budgets` |
| Library | CRUD under `/library/games`, `/library/books`, `/library/movies` |
| Memories · Places | CRUD under `/memories`, `/places` |
| Search | `GET /search?q=` (2–100 chars) |
| Assistant | `POST /assistant/chat` `{ today, messages[] }` |

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full walkthrough (Neon -> Render -> Vercel) with a verification checklist and troubleshooting table. Security notes and accepted risks are in **[SECURITY.md](SECURITY.md)**.

## Known limitations

- **Recurring tasks** store their frequency (and show an icon) but don't yet auto-create the next occurrence.
- **Photos** are links to images hosted elsewhere; there's no upload yet.
- **Lists aren't paginated.** Fine for personal use; worth adding past a few thousand rows per table.
- **Notifications** are computed while the app is open — there are no push/email notifications.
- **Library completions** have no completion date, so those are all-time totals rather than per-period.
- **Dashboard** layout is fixed (rearrangeable widgets were planned for later).
- **Search results** open the relevant page, not the individual item.
- Sessions can't be revoked server-side before they expire (see SECURITY.md).

## Roadmap ideas

Installable PWA / Capacitor app · Markdown notes · rearrangeable dashboard widgets · recurring-task generation · photo uploads (Supabase Storage / Cloudinary) · maps for Places · browser push notifications · `httpOnly` cookie sessions with refresh tokens · assistant actions with explicit confirmation · pagination · CSV export · end-to-end tests (Playwright) · Prisma 7 upgrade · currency setting.

## Licence

Personal project — not licensed for redistribution.
