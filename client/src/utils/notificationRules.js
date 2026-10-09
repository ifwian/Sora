import { formatShortDate, formatTime } from './date.js'

const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2 }
const MAX_PER_RULE = 5

/** Whole days from isoA to isoB (positive when isoB is later). Both are 'YYYY-MM-DD'. */
export function dayDiff(isoA, isoB) {
  const toUtc = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(isoB) - toUtc(isoA)) / 86400000)
}

function relativeDay(diff) {
  if (diff < 0) return `${-diff} day${diff === -1 ? '' : 's'} overdue`
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  return `in ${diff} days`
}

/** Caps a rule's items and adds a single "+N more" entry if there were extras. */
function capped(items, idPrefix, to, kindLabel) {
  if (items.length <= MAX_PER_RULE) return items
  const shown = items.slice(0, MAX_PER_RULE)
  const extra = items.length - MAX_PER_RULE
  return [
    ...shown,
    {
      id: `${idPrefix}:more`,
      severity: shown[0].severity,
      title: `+${extra} more ${kindLabel}`,
      detail: '',
      to,
    },
  ]
}

/**
 * buildNotifications — turns the app's current data into a prioritized list
 * of reminders. Pure: pass in the data and today's local date ('YYYY-MM-DD').
 * Ids are stable per item so a dismissal sticks until the next day.
 */
export function buildNotifications({
  today,
  tasks = [],
  events = [],
  habits = [],
  goals = [],
  assignments = [],
  expenses = [],
  budgets = [],
}) {
  const out = []

  // ---- Tasks: overdue + due today
  const openTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate)
  const overdue = openTasks
    .filter((t) => t.dueDate < today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((t) => ({
      id: `task-overdue:${t.id}`,
      severity: 'danger',
      title: `Overdue: ${t.title}`,
      detail: `Was due ${formatShortDate(t.dueDate)}`,
      to: '/tasks',
    }))
  out.push(...capped(overdue, 'task-overdue', '/tasks', 'overdue tasks'))

  const dueToday = openTasks
    .filter((t) => t.dueDate === today)
    .sort((a, b) => (a.dueTime ?? '99:99').localeCompare(b.dueTime ?? '99:99'))
    .map((t) => ({
      id: `task-today:${t.id}`,
      severity: 'warning',
      title: `Due today: ${t.title}`,
      detail: t.dueTime ? `By ${formatTime(t.dueTime)}` : '',
      to: '/tasks',
    }))
  out.push(...capped(dueToday, 'task-today', '/tasks', 'tasks due today'))

  // ---- Calendar: today and tomorrow
  const upcomingEvents = events
    .map((e) => ({ e, diff: dayDiff(today, e.date) }))
    .filter(({ diff }) => diff === 0 || diff === 1)
    .sort((a, b) => a.diff - b.diff || (a.e.startTime ?? '').localeCompare(b.e.startTime ?? ''))
    .map(({ e, diff }) => ({
      id: `event:${e.id}`,
      severity: 'info',
      title: `${diff === 0 ? 'Today' : 'Tomorrow'}: ${e.title}`,
      detail: e.startTime ? `At ${formatTime(e.startTime)}` : '',
      to: '/calendar',
    }))
  out.push(...capped(upcomingEvents, 'event', '/calendar', 'events'))

  // ---- Study: assignments within 3 days, exams within 7, anything overdue
  const studyItems = assignments
    .filter((a) => !a.completed)
    .map((a) => ({ a, diff: dayDiff(today, a.dueDate) }))
    .filter(({ a, diff }) => diff < 0 || diff <= (a.kind === 'EXAM' ? 7 : 3))
    .sort((x, y) => x.diff - y.diff)
    .map(({ a, diff }) => ({
      id: `study:${a.id}`,
      severity: diff <= 0 ? 'danger' : 'warning',
      title: `${a.kind === 'EXAM' ? 'Exam' : 'Assignment'}: ${a.title}`,
      detail: `Due ${relativeDay(diff)}`,
      to: '/study',
    }))
  out.push(...capped(studyItems, 'study', '/study', 'study deadlines'))

  // ---- Goals: deadline within 7 days (or passed) and not achieved
  const goalItems = goals
    .filter((g) => !g.completed && g.deadline)
    .map((g) => ({ g, diff: dayDiff(today, g.deadline) }))
    .filter(({ diff }) => diff <= 7)
    .sort((x, y) => x.diff - y.diff)
    .map(({ g, diff }) => ({
      id: `goal:${g.id}`,
      severity: diff < 0 ? 'danger' : 'warning',
      title: `Goal: ${g.title}`,
      detail: `Deadline ${relativeDay(diff)}`,
      to: '/goals',
    }))
  out.push(...capped(goalItems, 'goal', '/goals', 'goal deadlines'))

  // ---- Habits: a single nudge if any are still open today
  if (habits.length > 0) {
    const left = habits.filter((h) => !h.completedDates.includes(today))
    if (left.length > 0) {
      out.push({
        id: 'habits-left',
        severity: 'info',
        title: `${left.length} habit${left.length === 1 ? '' : 's'} left today`,
        detail: left
          .slice(0, 3)
          .map((h) => h.name)
          .join(', '),
        to: '/habits',
      })
    }
  }

  // ---- Finance: this month's spending vs budget
  const month = today.slice(0, 7)
  const budget = budgets.find((b) => b.month === month)
  if (budget && budget.amount > 0) {
    const spent = expenses.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + e.amount, 0)
    const ratio = spent / budget.amount
    if (ratio >= 1) {
      out.push({ id: `budget:${month}:over`, severity: 'danger', title: 'Over budget this month', detail: `${Math.round(ratio * 100)}% of your budget spent`, to: '/finance' })
    } else if (ratio >= 0.8) {
      out.push({ id: `budget:${month}:warn`, severity: 'warning', title: 'Close to your budget', detail: `${Math.round(ratio * 100)}% of your budget spent`, to: '/finance' })
    }
  }

  // Stable sort: most urgent first, otherwise keep the order the rules produced.
  return out
    .map((item, index) => ({ item, index }))
    .sort((a, b) => SEVERITY_ORDER[a.item.severity] - SEVERITY_ORDER[b.item.severity] || a.index - b.index)
    .map(({ item }) => item)
}
