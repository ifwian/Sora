import { addDays } from './calendar.js'

/** The last `count` days (oldest first), ending at `today`. */
export function windowDays(today, count) {
  return Array.from({ length: count }, (_, i) => addDays(today, i - (count - 1)))
}

/** A timestamp's calendar date in the viewer's local timezone, as 'YYYY-MM-DD'. */
export function localDateOf(timestamp) {
  const date = new Date(timestamp)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

/** Groups a day-by-day series into buckets of `size` days: [{ label: 'MM-DD', value }]. */
export function bucketize(days, valueByDate, size) {
  const buckets = []
  for (let i = 0; i < days.length; i += size) {
    const slice = days.slice(i, i + size)
    buckets.push({
      label: slice[0].slice(5),
      value: slice.reduce((sum, day) => sum + (valueByDate.get(day) ?? 0), 0),
    })
  }
  return buckets
}

function sumByDate(items, dateOf, valueOf) {
  const map = new Map()
  for (const item of items) {
    const date = dateOf(item)
    if (date) map.set(date, (map.get(date) ?? 0) + valueOf(item))
  }
  return map
}

/**
 * buildAnalytics — summary numbers for the last `periodDays` days.
 * Period metrics (tasks, study, habits, spending) use real dates; totals
 * (books/games/movies/goals) are all-time since they have no completion date.
 */
export function buildAnalytics({
  today,
  periodDays,
  tasks = [],
  sessions = [],
  habits = [],
  expenses = [],
  books = [],
  games = [],
  movies = [],
  goals = [],
}) {
  const days = windowDays(today, periodDays)
  const inWindow = new Set(days)
  const bucketSize = periodDays > 30 ? 7 : 1

  const completedByDate = sumByDate(
    tasks.filter((t) => t.status === 'COMPLETED' && t.completedAt),
    (t) => localDateOf(t.completedAt),
    () => 1
  )
  const minutesByDate = sumByDate(sessions, (s) => s.date, (s) => s.minutes)

  const habitRates = habits.map((h) => days.filter((d) => h.completedDates.includes(d)).length / periodDays)

  const windowExpenses = expenses.filter((e) => inWindow.has(e.date))
  const byCategory = new Map()
  for (const e of windowExpenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount)

  const sumWindow = (map) => days.reduce((sum, d) => sum + (map.get(d) ?? 0), 0)

  return {
    tasksCompleted: sumWindow(completedByDate),
    taskSeries: bucketize(days, completedByDate, bucketSize),
    studyMinutes: sumWindow(minutesByDate),
    studySeries: bucketize(days, minutesByDate, bucketSize).map((b) => ({ ...b, value: b.value / 60 })),
    habitRate: habits.length === 0 ? null : Math.round((habitRates.reduce((a, b) => a + b, 0) / habits.length) * 100),
    spent: windowExpenses.reduce((sum, e) => sum + e.amount, 0),
    topCategories: [...byCategory.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
    booksCompleted: books.filter((b) => b.status === 'COMPLETED').length,
    booksReading: books.filter((b) => b.status === 'READING').length,
    gamesCompleted: games.filter((g) => g.status === 'COMPLETED').length,
    moviesCompleted: movies.filter((m) => m.status === 'COMPLETED').length,
    goalsAchieved: goals.filter((g) => g.completed).length,
    goalsActive: goals.filter((g) => !g.completed).length,
  }
}
