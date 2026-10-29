import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'
import {
  ASSISTANT_CATEGORIES,
  CURRENCY_SYMBOLS,
  DASHBOARD_WIDGETS,
  DATE_FORMATS,
  DEFAULT_PREFERENCES,
  FOCUS_MODES,
  LEAD_TIME_FIELDS,
  NOTIFICATION_TYPES,
  TIMEZONES,
  TIME_FORMATS,
  WEEK_STARTS,
  dashboardWidgetsFor,
  resolvePreferences,
  visibleDashboardWidgets,
} from '../src/constants/preferences.js'
import { dateOnlyInZone, formatShortDate, formatTime, timeInZone } from '../src/utils/date.js'
import { formatMoney } from '../src/utils/financeUtils.js'
import { applyRuntimePreferences, resetRuntimePreferences } from '../src/utils/preferencesRuntime.js'
import { skyPhaseAt, skyPhaseForHour } from '../src/utils/sky.js'

const read = (relative) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8')
const ids = (list) => list.map((item) => item.id)

test("the client's settings lists match the server's validator exactly", () => {
  const server = read('../../server/src/validators/preferences.validator.js')
  const listFrom = (name) => {
    const body = server.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\]`))[1]
    return [...body.matchAll(/'([^']*)'/g)].map((match) => match[1])
  }
  assert.deepEqual(listFrom('TIMEZONES'), ids(TIMEZONES))
  assert.deepEqual(listFrom('WEEK_STARTS'), ids(WEEK_STARTS))
  assert.deepEqual(listFrom('CURRENCY_SYMBOLS'), ids(CURRENCY_SYMBOLS))
  assert.deepEqual(listFrom('DATE_FORMATS'), ids(DATE_FORMATS))
  assert.deepEqual(listFrom('TIME_FORMATS'), ids(TIME_FORMATS))
  assert.deepEqual(listFrom('FOCUS_MODES'), ids(FOCUS_MODES))
  assert.deepEqual(listFrom('DASHBOARD_WIDGETS'), ids(DASHBOARD_WIDGETS))
  assert.deepEqual(listFrom('NOTIFICATION_TYPES'), ids(NOTIFICATION_TYPES))
  assert.deepEqual(listFrom('LEAD_TIME_FIELDS'), ids(LEAD_TIME_FIELDS))
  assert.deepEqual(listFrom('ASSISTANT_CATEGORIES'), ids(ASSISTANT_CATEGORIES))
})

test('the defaults are complete and already resolved', () => {
  assert.deepEqual(resolvePreferences(DEFAULT_PREFERENCES), DEFAULT_PREFERENCES)
  assert.deepEqual(resolvePreferences({}), DEFAULT_PREFERENCES)
  assert.deepEqual(resolvePreferences(null), DEFAULT_PREFERENCES)
  assert.deepEqual(visibleDashboardWidgets(DEFAULT_PREFERENCES), [
    'tasks',
    'upcoming',
    'habits',
    'goals',
    'notes',
    'study',
    'finance',
  ])
})

test('resolvePreferences keeps valid choices and replaces invalid ones', () => {
  const resolved = resolvePreferences({
    timezone: 'Asia/Manila',
    weekStartsOn: 'sunday',
    currencySymbol: '₱',
    dateFormat: 'dmy',
    timeFormat: '24h',
    focusMode: 'study',
    dashboard: { widgets: [{ id: 'tasks', visible: false }] },
    notifications: { types: { tasks: false }, quietHours: { enabled: true, start: '23:00', end: '06:30' }, leadDays: { exams: 14 } },
    assistant: { finance: false },
    evil: 'nope',
  })
  assert.equal(resolved.timezone, 'Asia/Manila')
  assert.equal(resolved.weekStartsOn, 'sunday')
  assert.equal(resolved.currencySymbol, '₱')
  assert.equal(resolved.dateFormat, 'dmy')
  assert.equal(resolved.timeFormat, '24h')
  assert.equal(resolved.focusMode, 'study')
  assert.equal(resolved.notifications.types.tasks, false)
  assert.equal(resolved.notifications.types.events, true)
  assert.deepEqual(resolved.notifications.quietHours, { enabled: true, start: '23:00', end: '06:30' })
  assert.equal(resolved.notifications.leadDays.exams, 14)
  assert.equal(resolved.notifications.leadDays.tasks, 1)
  assert.equal(resolved.assistant.finance, false)
  assert.equal(resolved.assistant.tasks, true)
  assert.equal('evil' in resolved, false)

  const invalid = resolvePreferences({
    timezone: 'Mars/Olympus',
    weekStartsOn: 'friday',
    currencySymbol: 'XYZ',
    dateFormat: 'yolo',
    timeFormat: '13h',
    focusMode: 'party',
    notifications: { quietHours: { enabled: 'yes', start: '25:00', end: 'noon' }, leadDays: { exams: -3 } },
  })
  assert.equal(invalid.timezone, 'system')
  assert.equal(invalid.weekStartsOn, 'monday')
  assert.equal(invalid.currencySymbol, '')
  assert.equal(invalid.dateFormat, 'mdy')
  assert.equal(invalid.timeFormat, '12h')
  assert.equal(invalid.focusMode, 'none')
  assert.deepEqual(invalid.notifications.quietHours, { enabled: false, start: '22:00', end: '07:00' })
  assert.equal(invalid.notifications.leadDays.exams, 7)
})

test('dashboard order is kept, duplicates dropped, and new widgets appended', () => {
  const resolved = resolvePreferences({
    dashboard: {
      widgets: [
        { id: 'finance', visible: true },
        { id: 'tasks', visible: 'yes' },
        { id: 'finance', visible: false },
        { id: 'mystery', visible: true },
      ],
    },
  })
  const order = resolved.dashboard.widgets.map((widget) => widget.id)
  assert.equal(order[0], 'finance')
  assert.equal(order[1], 'tasks')
  assert.equal(new Set(order).size, DASHBOARD_WIDGETS.length)
  assert.deepEqual([...order].sort(), ids(DASHBOARD_WIDGETS).sort())
  assert.equal(resolved.dashboard.widgets[1].visible, true, 'invalid visible falls back to the widget default')
  assert.equal(resolved.dashboard.widgets.find((widget) => widget.id === 'forecast').visible, false)
})

test('date and time formatting follow the account preferences', () => {
  resetRuntimePreferences()
  assert.equal(formatShortDate('2026-09-05'), 'Sep 5')
  assert.equal(formatTime('17:05'), '5:05 PM')
  assert.equal(formatMoney(1234.5), '1,234.50')

  applyRuntimePreferences({ dateFormat: 'dmy', timeFormat: '24h', currencySymbol: '$' })
  assert.equal(formatShortDate('2026-09-05'), '5 Sep')
  assert.equal(formatShortDate('2026-09-05', 'iso'), '2026-09-05')
  assert.equal(formatTime('17:05'), '17:05')
  assert.equal(formatMoney(1234.5), '$1,234.50')

  applyRuntimePreferences({ currencySymbol: 'CHF' })
  assert.equal(formatMoney(5), 'CHF 5.00')

  resetRuntimePreferences()
  assert.equal(formatMoney(5), '5.00')
})

test('dateOnlyInZone converts the instant into the chosen time zone', () => {
  const instant = new Date('2026-09-05T23:30:00Z')
  assert.equal(dateOnlyInZone(instant, 'UTC'), '2026-09-05')
  assert.equal(dateOnlyInZone(instant, 'Asia/Manila'), '2026-09-06')
  assert.equal(dateOnlyInZone(instant, 'America/Los_Angeles'), '2026-09-05')
  assert.equal(dateOnlyInZone(instant, 'Not/AZone'), dateOnlyInZone(instant, 'system'))
  assert.equal(timeInZone(instant, 'UTC'), '23:30')
  assert.equal(timeInZone(instant, 'Asia/Manila'), '07:30')
  assert.equal(timeInZone(new Date('2026-09-05T09:05:00Z'), 'UTC'), '09:05')
})

test('focus modes narrow the visible dashboard widgets without changing their order', () => {
  const preferences = resolvePreferences({
    dashboard: {
      widgets: [
        { id: 'finance', visible: true },
        { id: 'tasks', visible: true },
        { id: 'notes', visible: true },
        { id: 'study', visible: true },
        { id: 'goals', visible: true },
        { id: 'habits', visible: true },
        { id: 'upcoming', visible: true },
        { id: 'forecast', visible: true },
      ],
    },
  })

  assert.deepEqual(dashboardWidgetsFor({ ...preferences, focusMode: 'none' }), [
    'finance',
    'tasks',
    'notes',
    'study',
    'goals',
    'habits',
    'upcoming',
    'forecast',
  ])
  assert.deepEqual(dashboardWidgetsFor({ ...preferences, focusMode: 'focus' }), ['tasks', 'forecast'])
  assert.deepEqual(dashboardWidgetsFor({ ...preferences, focusMode: 'study' }), ['tasks', 'study', 'goals', 'forecast'])
  assert.deepEqual(dashboardWidgetsFor({ ...preferences, focusMode: 'rest' }), ['notes', 'habits', 'upcoming', 'forecast'])
})

test('sky phases use calm, fixed hour boundaries', () => {
  const expected = {
    0: 'night', 4: 'night', 5: 'dawn', 8: 'dawn', 9: 'day', 12: 'day',
    16: 'day', 17: 'dusk', 19: 'dusk', 20: 'night', 23: 'night',
  }
  for (const [hour, phase] of Object.entries(expected)) {
    assert.equal(skyPhaseForHour(Number(hour)), phase, `hour ${hour}`)
  }
})

test('sky phases can be computed in the account time zone', () => {
  const instant = new Date('2026-09-05T23:30:00Z')
  assert.equal(skyPhaseAt(instant, 'UTC'), 'night')
  assert.equal(skyPhaseAt(instant, 'Asia/Manila'), 'dawn')
  assert.equal(skyPhaseAt(instant, 'system'), skyPhaseForHour(instant.getHours()))
})
