# Deploying Sora

```
 Browser ──▶ Vercel (React app, static)  ──▶ Render (Express API) ──▶ Neon / Supabase (PostgreSQL)
```

You'll need free accounts on **GitHub**, **Vercel**, **Render**, and **Neon** (or Supabase / Railway for the database).
Do the steps in this order — each one produces a URL the next step needs.

## 0. Push the project to GitHub
Create an empty GitHub repo, then from the `sora` folder:
```bash
git remote add origin https://github.com/YOUR-USER/sora.git
git push -u origin main
```
(If your default branch is `master`, push that instead.) `.env` files are git-ignored, so no secrets are uploaded.
Pushing also starts the **CI** workflow (`.github/workflows/ci.yml`), which runs the lint, tests and build — and is the first
place the Prisma-generated client runs for real. Check the **Actions** tab; if it fails, send me the error.

## 1. Database (Neon)
1. Create a project at neon.tech. Copy the **direct** connection string (not the "pooled" one) — it looks like
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`.
2. Keep it handy — it becomes `DATABASE_URL` in step 2. (Supabase works the same: use its *direct* connection string.)

## 2. API on Render
1. Render dashboard → **New → Blueprint** → select your repo. It reads `render.yaml`.
2. It will ask for the values marked `sync: false`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Neon string from step 1 |
| `CLIENT_ORIGIN` | leave a placeholder for now (`https://placeholder.vercel.app`) — you'll fix it in step 4 |
| `ANTHROPIC_API_KEY` | optional; from console.anthropic.com. Leave empty to disable the Assistant. **Set a monthly spend limit there.** |

   `JWT_SECRET` is generated for you; `TRUST_PROXY=1` and `NODE_ENV=production` are already set.
3. Deploy. The build runs `prisma generate` and `prisma migrate deploy`, which creates all tables.
4. When it's live, open `https://YOUR-API.onrender.com/api/health` — you should see `"Sora API is running."`
   Copy the base URL (no trailing slash).

## 3. Frontend on Vercel
1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** `client`. Framework preset: Vite (auto). Build `npm run build`, output `dist`.
3. **Environment variable:** `VITE_API_URL` = `https://YOUR-API.onrender.com/api` (note the `/api`).
   This is baked in at build time, so changing it later needs a redeploy.
4. **Before deploying**, edit `client/vercel.json`: replace `https://YOUR-API-HOST` in the `connect-src` part of the
   Content-Security-Policy with your API's origin, e.g. `https://YOUR-API.onrender.com`. Commit and push.
   (If you skip this the site loads but every request is blocked — the browser console says *"Refused to connect"*.)
5. Deploy and copy your site URL, e.g. `https://sora.vercel.app`.

## 4. Point the API at the frontend (CORS)
Render → your service → **Environment** → set `CLIENT_ORIGIN` to your exact Vercel URL — `https://sora.vercel.app`,
**no trailing slash** — and save (it redeploys).

## 5. Verify
- [ ] Visit the Vercel URL, **Create account**, land on the dashboard.
- [ ] Add a task, refresh the page — it's still there.
- [ ] Toggle dark mode, refresh — it sticks.
- [ ] Search for the task from the top bar.
- [ ] (If you set an API key) ask the Assistant "What should I focus on today?".
- [ ] Log out and back in.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Browser console: *"blocked by CORS policy"* | `CLIENT_ORIGIN` on Render doesn't exactly match the site URL (wrong value, `http` vs `https`, trailing slash). |
| Console: *"Refused to connect … Content Security Policy"* | You didn't replace `YOUR-API-HOST` in `client/vercel.json` (step 3.4). |
| Every request fails / "Failed to fetch" | `VITE_API_URL` missing or lacks `/api`. Fix it in Vercel and **redeploy**. |
| First request after a while takes ~30–60 s | Render's free tier sleeps when idle and wakes on the next request. Normal; paid plans don't sleep. |
| *"Too many requests"* for everyone at once | `TRUST_PROXY` isn't `1`, so all visitors share the proxy's IP and one rate-limit bucket. |
| API won't start: *"JWT_SECRET must be a random string…"* | The secret is missing/short. Let Render generate it (`generateValue`), or paste 48+ random characters. |
| Build fails with `P1001` / can't reach database | Wrong `DATABASE_URL`, or you used a pooled URL — use the direct one, and keep `?sslmode=require`. |
| Everyone got logged out | `JWT_SECRET` changed. Expected — sessions are tied to it. |
| Pages 404 on refresh | `client/vercel.json` rewrites missing, or Root Directory isn't `client`. |

## Good to know
- **Costs:** all of the above has a free tier. The Assistant is the only thing that costs money per use (Anthropic API).
- **Backups:** free database tiers have limited history — export important data occasionally.
- **Railway instead of Render:** create a service from the repo with root `server`, same variables, build command
  `npm ci && npx prisma generate && npx prisma migrate deploy`, start command `npm start`.
- **Custom domain:** add it in Vercel, then update `CLIENT_ORIGIN` on the API to match.
- **Rotating `JWT_SECRET`** logs everyone out — do it if you ever suspect it leaked.
