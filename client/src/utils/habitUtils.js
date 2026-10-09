import { addDays } from './calendar.js'
import { todayISO } from './date.js'

/** Consecutive days completed, counting back from today (or yesterday if today isn't done yet). */
export function calculateStreak(completedDates) {
  const done = new Set(completedDates)
  let cursor = todayISO()
  if (!done.has(cursor)) cursor = addDays(cursor, -1)

  let streak = 0
  while (done.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** The last `count` days as ISO strings, oldest first, ending today. */
export function lastNDays(count) {
  const today = todayISO()
  return Array.from({ length: count }, (_, index) => addDays(today, index - (count - 1)))
}

/** Percentage (0–100) of the last `days` days that were completed. */
export function completionRate(completedDates, days) {
  const done = new Set(completedDates)
  const window = lastNDays(days)
  const hits = window.filter((date) => done.has(date)).length
  return Math.round((hits / days) * 100)
}
