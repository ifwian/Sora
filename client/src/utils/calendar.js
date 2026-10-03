/** Calendar date-grid helpers. Dates are represented as 'YYYY-MM-DD' strings throughout. */

function toISO(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function addDays(isoDate, amount) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day + amount)
  return toISO(date)
}

export function addMonths(isoDate, amount) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1 + amount, day)
  return toISO(date)
}

export function startOfWeek(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return addDays(isoDate, -date.getDay())
}

/** Returns the 6x7 grid of ISO dates (Sun–Sat) needed to render a full month view. */
export function getMonthGrid(isoDate) {
  const [year, month] = isoDate.split('-').map(Number)
  const firstOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
  const gridStart = startOfWeek(firstOfMonth)
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

export function getWeekDates(isoDate) {
  const start = startOfWeek(isoDate)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function isSameMonth(isoDateA, isoDateB) {
  return isoDateA.slice(0, 7) === isoDateB.slice(0, 7)
}

export function isToday(isoDate) {
  return isoDate === toISO(new Date())
}

export function formatMonthLabel(isoDate) {
  const [year, month] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  )
}

export function formatDayLabel(isoDate, options = { weekday: 'short', month: 'short', day: 'numeric' }) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', options).format(new Date(year, month - 1, day))
}

export function formatWeekRangeLabel(isoDate) {
  const dates = getWeekDates(isoDate)
  const start = formatDayLabel(dates[0], { month: 'short', day: 'numeric' })
  const end = formatDayLabel(dates[6], { month: 'short', day: 'numeric' })
  return `${start} – ${end}`
}
