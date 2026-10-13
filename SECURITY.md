# Security notes

Findings from the Milestone 24 audit: what was checked, what was fixed, and what risk remains.

## What's in place

| Area | Protection |
|---|---|
| Passwords | bcrypt (cost 10), 8–72 chars. Login runs a dummy bcrypt compare for unknown emails so response time doesn't reveal which emails exist. |
| Sessions | JWT, **algorithm pinned to HS256** (blocks `alg: none` / algorithm-confusion), 7-day expiry. |
| Authorization | Every data route sits behind `requireAuth`, and every query is scoped by `userId`. Tested: another user gets `404`/empty on every read, edit, delete, and on linking to someone else's subject. |
| Mass assignment | All request bodies are validated with zod, which strips unknown keys, so `userId`/`id`/`completedAt` can't be forged. |
| Input validation | zod on every write. Photo links must be `http(s)://` (rejects `javascript:` / `data:`). |
| Rate limiting | 300 req / 15 min general; 20 / 15 min on login + register; 40 / 15 min per user on the AI assistant. |
| Headers / CORS | `helmet`; CORS locked to a single origin (`CLIENT_ORIGIN`); 100 kb body limit. |
| Errors | One central handler; stack traces are never sent in production; provider (Anthropic) errors are logged server-side only. |
| Secrets | `.env` is git-ignored; no secrets in the repo (scanned across history). In production the server **refuses to start** with a missing, short (<32 chars) or placeholder `JWT_SECRET`. |
| AI assistant | Read-only (no tools that change data). It only receives summaries scoped to the logged-in user; **notes, memories, places, email and password hash are never sent**. Text from your data is flattened and fenced so a task titled with instructions can't break out of the data block. |
| Browser hardening | `client/vercel.json` sets a strict Content-Security-Policy (no inline scripts, no framing, connections only to your API), HSTS, `nosniff`, a referrer policy and a permissions policy. |
| XSS | No `dangerouslySetInnerHTML` / `innerHTML` anywhere; React escapes everything, including AI replies (rendered as plain text). |

## Fixed during the audit

- **8 → 3 dependency vulnerabilities** (1 critical, 4 high removed): `npm audit fix` (incl. the critical `proxy-addr` IP-spoofing bug) and pinning Prisma to 6.19.3.
- **Prisma 7 → 6.19.3.** The schema uses the classic `datasource { url = env(...) }` setup; Prisma 7 changed how that's configured, so 6.x is the safe choice for this schema. Upgrade later by following Prisma's upgrade guide.
- JWT algorithm pinning; production secret enforcement; login timing equalisation.
- `TRUST_PROXY` support. Without it, behind Render/Railway every visitor shares the proxy's IP and would share one rate-limit bucket. **Set `TRUST_PROXY=1` in production.**
- A trailing slash on `CLIENT_ORIGIN` (a classic cause of mysterious CORS failures) is now stripped.
- `seed.js` refuses to run in production (it creates a known-password demo account).

## Known / accepted risks

1. **Token in `localStorage`.** Any XSS could read it. Mitigated by having no raw-HTML rendering and by the CSP set in `client/vercel.json`. The stronger design is an `httpOnly` cookie plus CSRF protection — a good future upgrade.
2. **No server-side logout / token revocation.** Logging out clears the browser's token, but a stolen token stays valid until it expires (7 days). Shorten `JWT_EXPIRES_IN` if that worries you.
3. **Registration reveals whether an email exists** (`409`). Accepted for a personal app; open registration should be disabled or invite-only if you make it public.
4. **3 remaining `npm audit` highs** (`deepmerge-ts` inside the Prisma CLI's config loader). This is build-time tooling that only reads your own local config; it isn't reachable from the network. (The `prisma` CLI is listed under `dependencies` so hosting providers that skip dev dependencies can still run `prisma migrate deploy`; `npm audit --omit=dev` therefore reports these three.)
5. **Photo links are hotlinks.** Viewing a memory loads the image from a third-party host, which can see your IP (referrer is suppressed). There's no upload feature yet.
6. **Dependency drift.** Run `npm audit` periodically.
