import { getRuntimePreferences } from './preferencesRuntime.js'

/** A Date's calendar day in a time zone, as 'YYYY-MM-DD'. 'system' uses this device. */
export function dateOnlyInZone(date = new Date(), timeZone = 'system') {
  if (!timeZone || timeZone === 'system') {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  }
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date)
    const value = (type) => parts.find((part) => part.type === type)?.value
    return `${value('year')}-${value('month')}-${value('day')}`
  } catch {
    // Unknown time zone — fall back to the device rather than crashing a render.
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  }
}

/** Today's date as 'YYYY-MM-DD', honouring the account's time zone. */
export function todayISO(timeZone = getRuntimePreferences().timezone) {
  return dateOnlyInZone(new Date(), timeZone)
}

/** The current clock time in a time zone, as 'HH:MM'. */
export function timeInZone(date = new Date(), timeZone = getRuntimePreferences().timezone) {
  const pad = (value) => String(value).padStart(2, '0')
  if (!timeZone || timeZone === 'system') return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const value = (type) => parts.find((part) => part.type === type)?.value
    return `${value('hour')}:${value('minute')}`
  } catch {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
}

/** Formats an ISO date ('YYYY-MM-DD') as "Sep 5", "5 Sep" or "2026-09-05". Returns null for falsy input. */
export function formatShortDate(isoDate, format = getRuntimePreferences().dateFormat) {
  if (!isoDate) return null
  if (format === 'iso') return isoDate

  const [year, month, day] = isoDate.split('-').map(Number)
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(year, month - 1, day))
  return format === 'dmy' ? `${day} ${monthName}` : `${monthName} ${day}`
}

/** Formats a 24h 'HH:MM' time as "5:00 PM" or "17:00". Returns null for falsy input. */
export function formatTime(time, format = getRuntimePreferences().timeFormat) {
  if (!time) return null

  const [hours, minutes] = time.split(':').map(Number)
  if (format === '24h') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const date = new Date()
  date.setHours(hours, minutes)
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)
}
