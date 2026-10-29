/**
 * Personal preferences beyond appearance. Pure data + helpers (no React / Vite imports)
 * so tests can load it directly.
 *
 * The ids here must match server/src/validators/preferences.validator.js — tests/preferences.test.mjs
 * checks every list against the server's arrays.
 */

export const TIMEZONES = [
  { id: 'system', label: 'This device’s time zone' },
  { id: 'UTC', label: 'UTC' },
  { id: 'America/New_York', label: 'New York (Eastern)' },
  { id: 'America/Chicago', label: 'Chicago (Central)' },
  { id: 'America/Denver', label: 'Denver (Mountain)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (Pacific)' },
  { id: 'America/Sao_Paulo', label: 'São Paulo' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Paris', label: 'Paris' },
  { id: 'Europe/Berlin', label: 'Berlin' },
  { id: 'Europe/Madrid', label: 'Madrid' },
  { id: 'Europe/Rome', label: 'Rome' },
  { id: 'Africa/Cairo', label: 'Cairo' },
  { id: 'Africa/Johannesburg', label: 'Johannesburg' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Asia/Kolkata', label: 'Kolkata' },
  { id: 'Asia/Shanghai', label: 'Shanghai' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Asia/Seoul', label: 'Seoul' },
  { id: 'Asia/Manila', label: 'Manila' },
  { id: 'Australia/Sydney', label: 'Sydney' },
  { id: 'Pacific/Auckland', label: 'Auckland' },
]

export const WEEK_STARTS = [
  { id: 'sunday', label: 'Sunday' },
  { id: 'monday', label: 'Monday' },
]

export const CURRENCY_SYMBOLS = [
  { id: '', label: 'No symbol' },
  { id: '$', label: 'Dollar — $' },
  { id: '€', label: 'Euro — €' },
  { id: '£', label: 'Pound — £' },
  { id: '¥', label: 'Yen / Yuan — ¥' },
  { id: '₱', label: 'Peso — ₱' },
  { id: '₹', label: 'Rupee — ₹' },
  { id: '₩', label: 'Won — ₩' },
  { id: '₺', label: 'Lira — ₺' },
  { id: 'R$', label: 'Real — R$' },
  { id: 'A$', label: 'Australian dollar — A$' },
  { id: 'C$', label: 'Canadian dollar — C$' },
  { id: 'CHF', label: 'Franc — CHF' },
  { id: 'kr', label: 'Krona / krone — kr' },
]

export const DATE_FORMATS = [
  { id: 'mdy', label: 'Sep 5', example: 'Sep 5' },
  { id: 'dmy', label: '5 Sep', example: '5 Sep' },
  { id: 'iso', label: '2026-09-05', example: '2026-09-05' },
]

export const TIME_FORMATS = [
  { id: '12h', label: '5:00 PM' },
  { id: '24h', label: '17:00' },
]

export const FOCUS_MODES = [
  { id: 'none', label: 'Clear', emoji: '🌿', blurb: 'Show everything' },
  { id: 'focus', label: 'Focus', emoji: '🎯', blurb: 'One thing at a time' },
  { id: 'study', label: 'Study', emoji: '📚', blurb: 'Deadlines and study time' },
  { id: 'rest', label: 'Rest', emoji: '☁️', blurb: 'A quieter dashboard' },
]

/** Dashboard widgets, in the order a new account starts with. */
export const DASHBOARD_WIDGETS = [
  { id: 'tasks', label: 'Today’s tasks', blurb: 'What is due today', defaultVisible: true },
  { id: 'forecast', label: 'Day forecast', blurb: 'A gentle look at the day ahead', defaultVisible: false },
  { id: 'upcoming', label: 'Upcoming', blurb: 'The next few events', defaultVisible: true },
  { id: 'habits', label: 'Habits', blurb: 'Today’s habit progress', defaultVisible: true },
  { id: 'goals', label: 'Goals', blurb: 'Active goals and progress', defaultVisible: true },
  { id: 'notes', label: 'Recent notes', blurb: 'Your latest notes', defaultVisible: true },
  { id: 'study', label: 'Study', blurb: 'Upcoming assignments and exams', defaultVisible: true },
  { id: 'finance', label: 'Finance', blurb: 'This month’s spending', defaultVisible: true },
]

export const NOTIFICATION_TYPES = [
  { id: 'tasks', label: 'Tasks', blurb: 'Overdue and due today' },
  { id: 'events', label: 'Calendar', blurb: 'Events today and tomorrow' },
  { id: 'study', label: 'Study', blurb: 'Assignments and exams coming up' },
  { id: 'goals', label: 'Goals', blurb: 'Goal deadlines' },
  { id: 'habits', label: 'Habits', blurb: 'A nudge if habits are still open' },
  { id: 'finance', label: 'Finance', blurb: 'Close to or over budget' },
]

export const LEAD_TIME_FIELDS = [
  { id: 'tasks', label: 'Tasks', defaultDays: 1, maxDays: 30 },
  { id: 'events', label: 'Events', defaultDays: 1, maxDays: 30 },
  { id: 'assignments', label: 'Assignments', defaultDays: 3, maxDays: 30 },
  { id: 'exams', label: 'Exams', defaultDays: 7, maxDays: 30 },
  { id: 'goals', label: 'Goals', defaultDays: 7, maxDays: 30 },
]

export const ASSISTANT_CATEGORIES = [
  { id: 'tasks', label: 'Tasks', blurb: 'Titles, priorities and due dates' },
  { id: 'events', label: 'Calendar', blurb: 'Event titles, times and places' },
  { id: 'habits', label: 'Habits', blurb: 'Names and recent progress' },
  { id: 'goals', label: 'Goals', blurb: 'Titles, milestones and deadlines' },
  { id: 'study', label: 'Study', blurb: 'Courses, deadlines, grades and study time' },
  { id: 'finance', label: 'Finance', blurb: 'Spending totals and categories' },
]

const idsOf = (list) => list.map((item) => item.id)
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/

export const DEFAULT_PREFERENCES = {
  timezone: 'system',
  weekStartsOn: 'monday',
  currencySymbol: '',
  dateFormat: 'mdy',
  timeFormat: '12h',
  focusMode: 'none',
  dashboard: {
    widgets: DASHBOARD_WIDGETS.map((widget) => ({ id: widget.id, visible: widget.defaultVisible })),
  },
  notifications: {
    types: Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type.id, true])),
    quietHours: { enabled: false, start: '22:00', end: '07:00' },
    leadDays: Object.fromEntries(LEAD_TIME_FIELDS.map((field) => [field.id, field.defaultDays])),
  },
  assistant: Object.fromEntries(ASSISTANT_CATEGORIES.map((category) => [category.id, true])),
}

function pick(list, value, fallback) {
  return list.some((option) => option.id === value) ? value : fallback
}

function resolveBoolMap(list, raw, fallback = true) {
  const source = raw && typeof raw === 'object' ? raw : {}
  return Object.fromEntries(list.map((item) => [item.id, typeof source[item.id] === 'boolean' ? source[item.id] : fallback]))
}

function resolveDashboard(raw) {
  const stored = Array.isArray(raw?.widgets) ? raw.widgets : []
  const known = new Map(DASHBOARD_WIDGETS.map((widget) => [widget.id, widget]))
  const seen = new Set()
  const widgets = []

  for (const item of stored) {
    if (!item || typeof item !== 'object' || !known.has(item.id) || seen.has(item.id)) continue
    seen.add(item.id)
    widgets.push({
      id: item.id,
      visible: typeof item.visible === 'boolean' ? item.visible : known.get(item.id).defaultVisible,
    })
  }

  // Widgets added in a later version appear for existing accounts too.
  for (const widget of DASHBOARD_WIDGETS) {
    if (!seen.has(widget.id)) widgets.push({ id: widget.id, visible: widget.defaultVisible })
  }
  return { widgets }
}

function resolveNotifications(raw) {
  const stored = raw && typeof raw === 'object' ? raw : {}
  const quiet = stored.quietHours && typeof stored.quietHours === 'object' ? stored.quietHours : {}
  const lead = stored.leadDays && typeof stored.leadDays === 'object' ? stored.leadDays : {}

  return {
    types: resolveBoolMap(NOTIFICATION_TYPES, stored.types),
    quietHours: {
      enabled: quiet.enabled === true,
      start: CLOCK.test(quiet.start) ? quiet.start : DEFAULT_PREFERENCES.notifications.quietHours.start,
      end: CLOCK.test(quiet.end) ? quiet.end : DEFAULT_PREFERENCES.notifications.quietHours.end,
    },
    leadDays: Object.fromEntries(
      LEAD_TIME_FIELDS.map((field) => {
        const value = lead[field.id]
        const valid = Number.isInteger(value) && value >= 0 && value <= field.maxDays
        return [field.id, valid ? value : field.defaultDays]
      })
    ),
  }
}

/**
 * resolvePreferences — a complete settings object. Unknown keys and invalid values
 * fall back to defaults, so old or malformed account data can never break the UI.
 */
export function resolvePreferences(raw) {
  const stored = raw && typeof raw === 'object' ? raw : {}
  return {
    timezone: pick(TIMEZONES, stored.timezone, DEFAULT_PREFERENCES.timezone),
    weekStartsOn: pick(WEEK_STARTS, stored.weekStartsOn, DEFAULT_PREFERENCES.weekStartsOn),
    currencySymbol: pick(CURRENCY_SYMBOLS, stored.currencySymbol, DEFAULT_PREFERENCES.currencySymbol),
    dateFormat: pick(DATE_FORMATS, stored.dateFormat, DEFAULT_PREFERENCES.dateFormat),
    timeFormat: pick(TIME_FORMATS, stored.timeFormat, DEFAULT_PREFERENCES.timeFormat),
    focusMode: pick(FOCUS_MODES, stored.focusMode, DEFAULT_PREFERENCES.focusMode),
    dashboard: resolveDashboard(stored.dashboard),
    notifications: resolveNotifications(stored.notifications),
    assistant: resolveBoolMap(ASSISTANT_CATEGORIES, stored.assistant),
  }
}

/** Widgets to draw, in the saved order. */
export function visibleDashboardWidgets(preferences) {
  return preferences.dashboard.widgets.filter((widget) => widget.visible).map((widget) => widget.id)
}

/** Lead time in days for a kind of reminder. */
export function leadDaysFor(preferences, field) {
  const fallback = LEAD_TIME_FIELDS.find((item) => item.id === field)?.defaultDays ?? 0
  return preferences.notifications.leadDays[field] ?? fallback
}

export { idsOf }
