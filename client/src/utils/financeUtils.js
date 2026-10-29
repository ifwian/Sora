import { getRuntimePreferences } from './preferencesRuntime.js'
import { todayISO } from './date.js'

/** Currency prefixes that read better with a space, e.g. "CHF 12.00". */
const SPACED_SYMBOLS = new Set(['CHF'])

export function formatMoney(amount, symbol = getRuntimePreferences().currencySymbol) {
  const value = Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (!symbol) return value
  return `${symbol}${SPACED_SYMBOLS.has(symbol) ? ' ' : ''}${value}`
}

export function currentMonthKey() {
  return todayISO().slice(0, 7)
}

/** Shifts a 'YYYY-MM' key by a number of months. */
export function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonthKey(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1))
}

export function monthTotal(expenses, monthKey) {
  return expenses.filter((e) => e.date.startsWith(monthKey)).reduce((sum, e) => sum + e.amount, 0)
}

/** [{ category, total }] for a month, largest first. */
export function categoryBreakdown(expenses, monthKey) {
  const totals = new Map()
  for (const e of expenses.filter((x) => x.date.startsWith(monthKey))) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }
  return [...totals.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total)
}

/** The last `count` month keys, oldest first, ending with `endKey`. */
export function lastMonths(count, endKey = currentMonthKey()) {
  return Array.from({ length: count }, (_, i) => shiftMonth(endKey, i - (count - 1)))
}
