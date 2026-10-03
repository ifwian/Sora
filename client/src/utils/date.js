/** Returns today's date as 'YYYY-MM-DD', matching <input type="date"> values. */
export function todayISO() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

/** Formats an ISO date ('YYYY-MM-DD') as e.g. "Sep 5". Returns null for falsy input. */
export function formatShortDate(isoDate) {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

/** Formats a 24h 'HH:MM' time string as e.g. "5:00 PM". Returns null for falsy input. */
export function formatTime(time) {
  if (!time) return null
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)
}
