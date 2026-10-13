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

/**
 * fromDateOnly — the inverse, for writes. The API accepts "YYYY-MM-DD" (zod
 * validates that shape) but Prisma only accepts a JS Date or a full ISO-8601
 * datetime for a DateTime/DATE column, so the bare date string has to be
 * converted before it reaches the query engine. UTC midnight keeps the stored
 * calendar day identical to the one the user sent, and matches what
 * toDateOnly reads back.
 */
export function fromDateOnly(value) {
  if (value == null) return null
  return new Date(`${value}T00:00:00Z`)
}

/**
 * coerceDates — copies `data` and converts any of `fields` that is a
 * "YYYY-MM-DD" string into a Date. Fields that are absent (undefined) or
 * already null are left exactly as they are, so a PATCH that doesn't mention
 * a date never clears it.
 */
export function coerceDates(data, fields) {
  if (fields.length === 0) return data
  const out = { ...data }
  for (const field of fields) {
    if (typeof out[field] === 'string') out[field] = fromDateOnly(out[field])
  }
  return out
}
