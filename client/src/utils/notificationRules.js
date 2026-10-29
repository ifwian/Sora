import { formatShortDate, formatTime } from './date.js'

const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2 }
const MAX_PER_RULE = 5
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/

const DEFAULT_TYPES = Object.fromEntries(
  ['tasks', 'events', 'study', 'goals', 'habits', 'finance'].map((type) => [type, true])
)
const DEFAULT_LEAD_DAYS = { tasks: 1, events: 1, assignments: 3, exams: 7, goals: 7 }

/** Which reminder types stay visible in each focus mode. null = no filtering. */
const FOCUS_TYPES = {
  none: null,
  focus: new Set(['tasks']),
  study: new Set(['tasks', 'study', 'goals']),
  rest: new Set(['events', 'habits']),
}

/** Whole days from isoA to isoB (positive when isoB is later). Both are 'YYYY-MM-DD'. */
export function dayDiff(isoA, isoB) {
  const toUtc = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(isoB) - toUtc(isoA)) / 86400000)
}

/** True when 'HH:MM' falls inside the quiet window. Overnight windows (22:00–07:00) are supported. */
export function isQuietHours(quietHours, timeOfDay) {
  if (!quietHours?.enabled || !timeOfDay) return false
  const { start, end } = quietHours
  if (!CLOCK.test(start) || !CLOCK.test(end)) return false
  if (start === end) return true
  return start < end ? timeOfDay >= start && timeOfDay < end : timeOfDay >= start || timeOfDay < end
}

function relativeDay(diff) {
  if (diff < 0) return `${-diff} day${diff === -1 ? '' : 's'} overdue`
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  return `in ${diff} days`
}

function eventDay(diff) {
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
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
 * buildNotifications — turns the app's current data into a prioritized list of
 * reminders. Pure: pass in the data, today's date ('YYYY-MM-DD') and the user's
 * notification settings. Notification types, lead times, quiet hours and focus
 * mode are all applied here.
 */
export function buildNotifications({
  today,
  timeOfDay = null,
  tasks = [],
  events = [],
  habits = [],
  goals = [],
  assignments = [],
  expenses = [],
  budgets = [],
  settings = null,
  focusMode = 'none',
}) {
  const types = { ...DEFAULT_TYPES, ...(settings?.types ?? {}) }
  const lead = { ...DEFAULT_LEAD_DAYS, ...(settings?.leadDays ?? {}) }
  const quietHours = settings?.quietHours ?? { enabled: false, start: '22:00', end: '07:00' }

  if (isQuietHours(quietHours, timeOfDay)) return []

  const focus = FOCUS_TYPES[focusMode] ?? null
  const active = (type) => types[type] !== false && (!focus || focus.has(type))

  const out = []

  // ---- Tasks: overdue, due today, and anything inside the chosen lead time
  if (active('tasks')) {
    const openTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate)
    const taskLead = focusMode === 'focus' ? 0 : lead.tasks

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

    const dueSoon = openTasks
      .filter((t) => t.dueDate > today && dayDiff(today, t.dueDate) <= taskLead)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map((t) => {
        const diff = dayDiff(today, t.dueDate)
        return {
          id: `task-soon:${t.id}`,
          severity: 'info',
          title: `Soon: ${t.title}`,
          detail: `Due ${relativeDay(diff)}`,
          to: '/tasks',
        }
      })
    out.push(...capped(dueSoon, 'task-soon', '/tasks', 'upcoming tasks'))
  }

  // ---- Calendar: anything inside the chosen lead time
  if (active('events')) {
    const upcomingEvents = events
      .map((e) => ({ e, diff: dayDiff(today, e.date) }))
      .filter(({ diff }) => diff >= 0 && diff <= lead.events)
      .sort((a, b) => a.diff - b.diff || (a.e.startTime ?? '').localeCompare(b.e.startTime ?? ''))
      .map(({ e, diff }) => ({
        id: `event:${e.id}`,
        severity: 'info',
        title: `${eventDay(diff)}: ${e.title}`,
        detail: e.startTime ? `At ${formatTime(e.startTime)}` : '',
        to: '/calendar',
      }))
    out.push(...capped(upcomingEvents, 'event', '/calendar', 'events'))
  }

  // ---- Study: assignments and exams use their own lead times; overdue is always shown
  if (active('study')) {
    const studyItems = assignments
      .filter((a) => !a.completed)
      .map((a) => ({ a, diff: dayDiff(today, a.dueDate) }))
      .filter(({ a, diff }) => diff < 0 || diff <= (a.kind === 'EXAM' ? lead.exams : lead.assignments))
      .sort((x, y) => x.diff - y.diff)
      .map(({ a, diff }) => ({
        id: `study:${a.id}`,
        severity: diff <= 0 ? 'danger' : 'warning',
        title: `${a.kind === 'EXAM' ? 'Exam' : 'Assignment'}: ${a.title}`,
        detail: `Due ${relativeDay(diff)}`,
        to: '/study',
      }))
    out.push(...capped(studyItems, 'study', '/study', 'study deadlines'))
  }

  // ---- Goals: deadline inside the chosen lead time (or passed) and not achieved
  if (active('goals')) {
    const goalItems = goals
      .filter((g) => !g.completed && g.deadline)
      .map((g) => ({ g, diff: dayDiff(today, g.deadline) }))
      .filter(({ diff }) => diff <= lead.goals)
      .sort((x, y) => x.diff - y.diff)
      .map(({ g, diff }) => ({
        id: `goal:${g.id}`,
        severity: diff < 0 ? 'danger' : 'warning',
        title: `Goal: ${g.title}`,
        detail: `Deadline ${relativeDay(diff)}`,
        to: '/goals',
      }))
    out.push(...capped(goalItems, 'goal', '/goals', 'goal deadlines'))
  }

  // ---- Habits: a single nudge if any are still open today
  if (active('habits') && habits.length > 0) {
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
  if (active('finance')) {
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
  }

  // Stable sort: most urgent first, otherwise keep the order the rules produced.
  return out
    .map((item, index) => ({ item, index }))
    .sort((a, b) => SEVERITY_ORDER[a.item.severity] - SEVERITY_ORDER[b.item.severity] || a.index - b.index)
    .map(({ item }) => item)
}
