process.env.TZ = 'Asia/Manila' // UTC+8 — a timezone where "local today" differs from UTC for much of the day

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bucketize, buildAnalytics, localDateOf, windowDays } from '../src/utils/analytics.js'

const today = '2026-10-09'

test('windowDays: oldest first, ends today, correct length', () => {
  const days = windowDays(today, 7)
  assert.equal(days.length, 7)
  assert.equal(days[0], '2026-10-03')
  assert.equal(days[6], today)
})

test('localDateOf uses the local timezone, not UTC', () => {
  // 16:30 UTC on Oct 9 is 00:30 on Oct 10 in Manila
  assert.equal(localDateOf('2026-10-09T16:30:00Z'), '2026-10-10')
  assert.equal(localDateOf('2026-10-09T15:59:00Z'), '2026-10-09')
})

test('bucketize: sums per bucket, partial last bucket, missing days count as 0', () => {
  const days = windowDays(today, 10)
  const values = new Map([[days[0], 2], [days[6], 3], [days[9], 5]])
  const buckets = bucketize(days, values, 7)
  assert.equal(buckets.length, 2)
  assert.equal(buckets[0].value, 5) // days 0-6
  assert.equal(buckets[1].value, 5) // days 7-9
  assert.equal(buckets[0].label, days[0].slice(5))
})

test('tasks completed are counted by LOCAL completion day, within the window only', () => {
  const tasks = [
    { status: 'COMPLETED', completedAt: '2026-10-09T01:00:00Z' }, // local Oct 9 -> in
    { status: 'COMPLETED', completedAt: '2026-10-09T16:30:00Z' }, // local Oct 10 -> OUT (future of window)
    { status: 'COMPLETED', completedAt: '2026-10-02T10:00:00Z' }, // 7d window starts Oct 3 -> out
    { status: 'COMPLETED', completedAt: '2026-10-03T10:00:00Z' }, // in
    { status: 'TODO', completedAt: null },
    { status: 'COMPLETED', completedAt: null }, // legacy/odd row: ignored, no crash
  ]
  const a = buildAnalytics({ today, periodDays: 7, tasks })
  assert.equal(a.tasksCompleted, 2)
  assert.equal(a.taskSeries.length, 7)
  assert.equal(a.taskSeries.reduce((s, b) => s + b.value, 0), 2)
})

test('study minutes sum in window and convert to hours in the series', () => {
  const sessions = [
    { date: '2026-10-09', minutes: 90 },
    { date: '2026-10-05', minutes: 30 },
    { date: '2026-09-01', minutes: 600 }, // outside
  ]
  const a = buildAnalytics({ today, periodDays: 7, sessions })
  assert.equal(a.studyMinutes, 120)
  assert.equal(a.studySeries.reduce((s, b) => s + b.value, 0), 2)
})

test('habit rate: average across habits; null when there are no habits', () => {
  assert.equal(buildAnalytics({ today, periodDays: 7 }).habitRate, null)
  const habits = [
    { completedDates: windowDays(today, 7) }, // 100%
    { completedDates: [] }, // 0%
  ]
  assert.equal(buildAnalytics({ today, periodDays: 7, habits }).habitRate, 50)
  // dates outside the window don't count
  assert.equal(buildAnalytics({ today, periodDays: 7, habits: [{ completedDates: ['2026-01-01'] }] }).habitRate, 0)
})

test('spending: window total and top categories sorted, capped at 5', () => {
  const expenses = [
    { date: today, category: 'Food', amount: 100 },
    { date: today, category: 'Food', amount: 50 },
    { date: '2026-10-08', category: 'School', amount: 200 },
    { date: '2026-08-01', category: 'Shopping', amount: 999 }, // outside
    ...['A', 'B', 'C', 'D', 'E'].map((category) => ({ date: today, category, amount: 1 })),
  ]
  const a = buildAnalytics({ today, periodDays: 30, expenses })
  assert.equal(a.spent, 355)
  assert.deepEqual(a.topCategories[0], { category: 'School', total: 200 })
  assert.equal(a.topCategories[1].category, 'Food')
  assert.equal(a.topCategories.length, 5)
})

test('90-day period uses weekly buckets', () => {
  const a = buildAnalytics({ today, periodDays: 90 })
  assert.equal(a.taskSeries.length, 13)
})

test('library and goal totals', () => {
  const a = buildAnalytics({
    today,
    periodDays: 7,
    books: [{ status: 'COMPLETED' }, { status: 'READING' }, { status: 'COMPLETED' }],
    games: [{ status: 'COMPLETED' }, { status: 'BACKLOG' }],
    movies: [{ status: 'COMPLETED' }],
    goals: [{ completed: true }, { completed: false }, { completed: false }],
  })
  assert.deepEqual(
    [a.booksCompleted, a.booksReading, a.gamesCompleted, a.moviesCompleted, a.goalsAchieved, a.goalsActive],
    [2, 1, 1, 1, 1, 2]
  )
})
