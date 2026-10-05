/**
 * toDateOnly — Prisma/pg return DATE columns as full Date objects, which
 * JSON.stringify turns into full ISO datetimes (e.g. "2026-10-05T00:00:00.000Z").
 * The frontend works with plain "YYYY-MM-DD" strings throughout, so this
 * trims it down before a response goes out. Safe to call on null.
 */
export function toDateOnly(date) {
  if (!date) return null
  return new Date(date).toISOString().slice(0, 10)
}
