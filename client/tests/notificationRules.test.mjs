import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildNotifications, dayDiff, isQuietHours } from '../src/utils/notificationRules.js'

const today = '2026-10-09'

test('dayDiff handles month/year boundaries', () => {
  assert.equal(dayDiff('2026-10-09', '2026-10-10'), 1)
  assert.equal(dayDiff('2026-10-31', '2026-11-01'), 1)
  assert.equal(dayDiff('2026-12-31', '2027-01-01'), 1)
  assert.equal(dayDiff('2026-10-09', '2026-10-02'), -7)
  assert.equal(dayDiff('2026-03-28', '2026-03-29'), 1) // DST-safe
})

test('empty data -> no notifications', () => assert.deepEqual(buildNotifications({ today }), []))

test('overdue + due-today tasks; completed and undated are ignored', () => {
  const tasks = [
    { id: 'a', title: 'Old', status: 'TODO', dueDate: '2026-10-05' },
    { id: 'b', title: 'Now', status: 'IN_PROGRESS', dueDate: today, dueTime: '17:00' },
    { id: 'c', title: 'Done', status: 'COMPLETED', dueDate: '2026-10-01' },
    { id: 'd', title: 'No date', status: 'TODO', dueDate: null },
    { id: 'e', title: 'Future', status: 'TODO', dueDate: '2026-10-20' },
  ]
  const n = buildNotifications({ today, tasks })
  assert.equal(n.length, 2)
  assert.equal(n[0].id, 'task-overdue:a'); assert.equal(n[0].severity, 'danger')
  assert.equal(n[1].id, 'task-today:b'); assert.equal(n[1].detail, 'By 5:00 PM')
})

test('more than 5 overdue tasks collapse into "+N more"', () => {
  const tasks = Array.from({ length: 8 }, (_, i) => ({ id: `t${i}`, title: `T${i}`, status: 'TODO', dueDate: '2026-10-01' }))
  const n = buildNotifications({ today, tasks })
  assert.equal(n.length, 6)
  assert.equal(n[5].title, '+3 more overdue tasks')
})

test('events: today and tomorrow only', () => {
  const events = [
    { id: '1', title: 'Lab', date: today, startTime: '15:00' },
    { id: '2', title: 'Gym', date: '2026-10-10' },
    { id: '3', title: 'Later', date: '2026-10-12' },
    { id: '4', title: 'Past', date: '2026-10-08' },
  ]
  const n = buildNotifications({ today, events })
  assert.deepEqual(n.map((x) => x.id), ['event:1', 'event:2'])
})

test('study: assignment 3-day window, exam 7-day window, overdue is danger, completed ignored', () => {
  const assignments = [
    { id: 'a1', title: 'HW', kind: 'ASSIGNMENT', dueDate: '2026-10-12', completed: false }, // 3 days -> yes
    { id: 'a2', title: 'HW2', kind: 'ASSIGNMENT', dueDate: '2026-10-13', completed: false }, // 4 days -> no
    { id: 'x1', title: 'Midterm', kind: 'EXAM', dueDate: '2026-10-16', completed: false }, // 7 days -> yes
    { id: 'x2', title: 'Final', kind: 'EXAM', dueDate: '2026-10-17', completed: false }, // 8 -> no
    { id: 'a3', title: 'Late', kind: 'ASSIGNMENT', dueDate: '2026-10-07', completed: false }, // overdue
    { id: 'a4', title: 'Done', kind: 'ASSIGNMENT', dueDate: today, completed: true },
  ]
  const n = buildNotifications({ today, assignments })
  assert.deepEqual(n.map((x) => x.id), ['study:a3', 'study:a1', 'study:x1'])
  assert.equal(n[0].severity, 'danger'); assert.equal(n[0].detail, 'Due 2 days overdue')
})

test('habits nudge only when some are open today', () => {
  const open = [{ id: 'h', name: 'Code', completedDates: [] }, { id: 'h2', name: 'Read', completedDates: [today] }]
  assert.equal(buildNotifications({ today, habits: open })[0].title, '1 habit left today')
  assert.equal(buildNotifications({ today, habits: [{ id: 'h', name: 'Code', completedDates: [today] }] }).length, 0)
})

test('budget: 79% silent, 80% warns, 100% danger; other months ignored', () => {
  const mk = (spent) => buildNotifications({ today, budgets: [{ month: '2026-10', amount: 1000 }], expenses: [{ date: '2026-10-03', amount: spent }, { date: '2026-09-30', amount: 5000 }] })
  assert.equal(mk(790).length, 0)
  assert.equal(mk(800)[0].severity, 'warning')
  assert.equal(mk(1000)[0].severity, 'danger')
  assert.equal(buildNotifications({ today, budgets: [{ month: '2026-10', amount: 0 }], expenses: [{ date: today, amount: 5 }] }).length, 0)
})

test('goals: within 7 days warns, passed is danger, achieved ignored', () => {
  const goals = [
    { id: 'g1', title: 'A', deadline: '2026-10-14', completed: false },
    { id: 'g2', title: 'B', deadline: '2026-10-01', completed: false },
    { id: 'g3', title: 'C', deadline: '2026-10-01', completed: true },
    { id: 'g4', title: 'D', deadline: '2026-10-30', completed: false },
  ]
  const n = buildNotifications({ today, goals })
  assert.deepEqual(n.map((x) => [x.id, x.severity]), [['goal:g2', 'danger'], ['goal:g1', 'warning']])
})

test('ordering: danger before warning before info', () => {
  const n = buildNotifications({
    today,
    habits: [{ id: 'h', name: 'x', completedDates: [] }],
    tasks: [{ id: 'a', title: 'T', status: 'TODO', dueDate: today }, { id: 'b', title: 'O', status: 'TODO', dueDate: '2026-10-01' }],
  })
  assert.deepEqual(n.map((x) => x.severity), ['danger', 'warning', 'info'])
})

const allData = {
  tasks: [{ id: 't', title: 'Task', status: 'TODO', dueDate: today }],
  events: [{ id: 'e', title: 'Event', date: today }],
  goals: [{ id: 'g', title: 'Goal', deadline: today, completed: false }],
  assignments: [{ id: 'a', title: 'Exam', kind: 'EXAM', dueDate: today, completed: false }],
  budgets: [{ month: '2026-10', amount: 100 }],
  expenses: [{ date: today, amount: 100 }],
}

test('notification types can be turned off independently', () => {
  const noTasks = buildNotifications({
    today,
    ...allData,
    settings: { types: { tasks: false }, leadDays: {}, quietHours: { enabled: false } },
  })
  assert.equal(noTasks.some((n) => n.id.startsWith('task-')), false)
  assert.equal(noTasks.some((n) => n.id.startsWith('event:')), true)

  const nothing = buildNotifications({
    today,
    ...allData,
    settings: { types: { tasks: false, events: false, study: false, goals: false, habits: false, finance: false } },
  })
  assert.deepEqual(nothing, [])
})

test('lead times widen the reminder window', () => {
  const tasks = [{ id: 'later', title: 'Later', status: 'TODO', dueDate: '2026-10-12' }]
  const events = [{ id: 'later', title: 'Later', date: '2026-10-12' }]
  const goals = [{ id: 'later', title: 'Later', deadline: '2026-10-19', completed: false }]
  const assignments = [{ id: 'later', title: 'Later', kind: 'ASSIGNMENT', dueDate: '2026-10-13', completed: false }]

  // Each of these sits just outside its default window (tasks/events 1 day,
  // assignments 3 days, goals 7 days).
  for (const data of [{ tasks }, { events }, { goals }, { assignments }]) {
    assert.deepEqual(buildNotifications({ today, ...data }), [])
  }

  const settings = { leadDays: { tasks: 3, events: 3, goals: 10, assignments: 4, exams: 7 } }
  assert.equal(buildNotifications({ today, tasks, settings })[0].id, 'task-soon:later')
  assert.equal(buildNotifications({ today, events, settings })[0].id, 'event:later')
  assert.equal(buildNotifications({ today, goals, settings }).length, 1)
  assert.equal(buildNotifications({ today, assignments, settings }).length, 1)
})

test('quiet hours silence reminders, including overnight windows', () => {
  assert.equal(isQuietHours({ enabled: true, start: '22:00', end: '07:00' }, '23:30'), true)
  assert.equal(isQuietHours({ enabled: true, start: '22:00', end: '07:00' }, '06:59'), true)
  assert.equal(isQuietHours({ enabled: true, start: '22:00', end: '07:00' }, '07:00'), false)
  assert.equal(isQuietHours({ enabled: true, start: '22:00', end: '07:00' }, '12:00'), false)
  assert.equal(isQuietHours({ enabled: false, start: '22:00', end: '07:00' }, '23:30'), false)
  assert.equal(isQuietHours({ enabled: true, start: '25:00', end: '07:00' }, '23:30'), false)
  assert.equal(isQuietHours({ enabled: true, start: '09:00', end: '17:00' }, '12:00'), true)
  assert.equal(isQuietHours({ enabled: true, start: '09:00', end: '17:00' }, '17:00'), false)

  const quiet = { enabled: true, start: '22:00', end: '07:00' }
  assert.deepEqual(buildNotifications({ today, ...allData, timeOfDay: '23:30', settings: { quietHours: quiet } }), [])
  assert.equal(buildNotifications({ today, ...allData, timeOfDay: '12:00', settings: { quietHours: quiet } }).length, 5)
  assert.equal(buildNotifications({ today, ...allData, settings: { quietHours: quiet } }).length, 5, 'without a clock time, quiet hours are not assumed')
})

test('focus modes keep only their reminder types', () => {
  const ids = (focusMode) => buildNotifications({ today, ...allData, focusMode }).map((n) => n.id)

  assert.deepEqual(ids('focus'), ['task-today:t'])
  assert.deepEqual(ids('study').sort(), ['goal:g', 'study:a', 'task-today:t'])
  assert.deepEqual(ids('rest'), ['event:e'])
  assert.equal(ids('none').length, 5)
})

test('focus mode does not surface tasks that are merely upcoming', () => {
  const tasks = [{ id: 'tomorrow', title: 'Tomorrow', status: 'TODO', dueDate: '2026-10-10' }]
  assert.equal(buildNotifications({ today, tasks }).length, 1)
  assert.deepEqual(buildNotifications({ today, tasks, focusMode: 'focus' }), [])
})
