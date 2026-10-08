import { addDays } from './calendar'
import { todayISO } from './date'

export function gradePercent(grade) {
  return (grade.score / grade.maxScore) * 100
}

/** Average of all grades as a percentage, or null if there are none. */
export function averageGrade(grades) {
  if (grades.length === 0) return null
  return grades.reduce((sum, g) => sum + gradePercent(g), 0) / grades.length
}

/** The soonest not-yet-completed item of a kind ('ASSIGNMENT' | 'EXAM') due today or later. */
export function nextUpcoming(assignments, kind) {
  const today = todayISO()
  return (
    assignments
      .filter((a) => a.kind === kind && !a.completed && a.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null
  )
}

/** Total minutes studied in the last `days` days (including today). */
export function minutesInLastDays(sessions, days) {
  const earliest = addDays(todayISO(), -(days - 1))
  return sessions.filter((s) => s.date >= earliest).reduce((sum, s) => sum + s.minutes, 0)
}

export function formatHours(minutes) {
  return `${(minutes / 60).toFixed(1)}h`
}
