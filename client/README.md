# Sora — Productivity Companion

A private personal-productivity app built with React, Vite, and Lakebase Postgres on Neon.

## Stage 2: Settings Studio ✅

All 7 settings tabs with full persistence, strict validation, and comprehensive testing:

- **Preferences** — Time zone, week start, currency, date/time format, focus mode
- **Dashboard** — Widget order/visibility with drag-and-drop, reset, focus-mode filtering
- **Notifications** — Reminder types, quiet hours (overnight support), lead days per type
- **Assistant & privacy** — Per-category access gating, "never shared" list
- **Your data** — JSON export (never includes password hash), password-confirmed deletion with cascade
- **Appearance** — 7 palettes (incl. `sky` with dawn/day/dusk/night phases), modes, radius, text size
- **Account** — Session management

**Verification:** 71/71 server tests, 454/454 client tests, oxlint clean, `npm run build` succeeds, WCAG AA contrast

## Stage 3: Visual Features (Partial) 🟡

### Fonts
- `@fontsource/nunito` and `@fontsource/quicksand` — configured as `--font-sans: "Nunito Variable", "Quicksand Variable", "Manrope Variable"`

### Cloud Mascot & Background
- `CloudMascot.jsx` — inline SVG cloud component
- `DriftingClouds.jsx` — multiple drifting clouds with `prefers-reduced-motion` respect
- `favicon-cloud.svg` — cloud silhouette favicon

### Mood Check-in
- `MoodWidget.jsx` — 5 emoji options, 7-day trend stored in `localStorage` (`sora-mood`, `sora-mood-trend`)

### Habit Constellations
- `HabitConstellation.jsx` — hash-derived starfield based on habit data, subtle animated drift

### Celebration Effects
- `ConfettiExplosion.jsx` — burst of colored particles on task completion, milestone achievement

### Accessibility
- All Stage 3 features respect `prefers-reduced-motion` — no animations when the user prefers reduced motion
- WCAG AA contrast validated for all palettes + sky phases

## Build & Test Status

| Suite | Tests | Status |
|-------|-------|--------|
| Server | 71/71 | ✅ Passing |
| Client | 454/454 | ✅ Passing |
| Lint | oxlint | ✅ Clean |
| Build | `vite build` | ✅ Succeeds |
| Audit | `npm audit` (client) | ✅ 0 vulnerabilities |
| Audit | `npm audit` (server) | ⚠️ 3 high (deepmerge-ts, prisma — beyond `--force` scope) |

## Remaining Work

- Sparkle/confetti integration (already delivered as `ConfettiExplosion.jsx` component)
- Paginate lists past ~2000 rows with backward-compatible shape
- Update documentation and screenshots for all new features
- Server audit cleanup (requires `--force` or manual dependency updates)

## Getting Started

```bash
# Client
cd client
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build
npm test          # run test suite

# Server
cd server
npm install
npm run dev       # API at http://localhost:5000
npm test          # run API test suite
```