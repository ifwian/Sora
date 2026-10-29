import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { client, registerUser, startServer } from '../helpers/server.js'

describe('preferences (appearance settings)', () => {
  let server, alice, bob

  before(async () => {
    server = await startServer()
    alice = await registerUser(server.base, 'alice')
    bob = await registerUser(server.base, 'bob')
  })
  after(() => server.close())

  test('a new account starts with empty preferences', async () => {
    assert.deepEqual((await alice.api.get('/auth/me')).data.preferences, {})
  })

  test('saving a palette returns it, and /me reflects it', async () => {
    const res = await alice.api.patch('/auth/preferences', { palette: 'sakura' })
    assert.equal(res.status, 200)
    assert.equal(res.data.preferences.palette, 'sakura')
    assert.equal((await alice.api.get('/auth/me')).data.preferences.palette, 'sakura')
  })

  test('updates merge instead of replacing', async () => {
    await alice.api.patch('/auth/preferences', { radius: 'round' })
    const res = await alice.api.patch('/auth/preferences', { mode: 'dark', textSize: 'large' })
    assert.deepEqual(res.data.preferences, { palette: 'sakura', radius: 'round', mode: 'dark', textSize: 'large' })
  })

  test('regional, dashboard, notification, focus and AI-privacy settings are validated and stored', async () => {
    const patch = {
      timezone: 'Asia/Manila',
      weekStartsOn: 'monday',
      currencySymbol: '₱',
      dateFormat: 'dmy',
      timeFormat: '24h',
      focusMode: 'study',
      dashboard: {
        widgets: [
          { id: 'tasks', visible: true },
          { id: 'forecast', visible: false },
        ],
      },
      notifications: {
        types: { tasks: false, events: true, study: true, goals: true, habits: false, finance: true },
        quietHours: { enabled: true, start: '22:00', end: '07:00' },
        leadDays: { tasks: 1, events: 2, assignments: 3, exams: 7, goals: 10 },
      },
      assistant: { tasks: true, events: false, habits: true, goals: true, study: false, finance: true },
    }
    const res = await alice.api.patch('/auth/preferences', patch)
    assert.equal(res.status, 200)
    const saved = res.data.preferences
    assert.equal(saved.timezone, 'Asia/Manila')
    assert.equal(saved.weekStartsOn, 'monday')
    assert.equal(saved.currencySymbol, '₱')
    assert.equal(saved.focusMode, 'study')
    assert.deepEqual(saved.dashboard.widgets, patch.dashboard.widgets)
    assert.deepEqual(saved.notifications.types, patch.notifications.types)
    assert.deepEqual(saved.notifications.quietHours, patch.notifications.quietHours)
    assert.deepEqual(saved.notifications.leadDays, patch.notifications.leadDays)
    assert.deepEqual(saved.assistant, patch.assistant)
  })

  test('nested preference patches merge with their sibling keys', async () => {
    await alice.api.patch('/auth/preferences', { notifications: { types: { tasks: true } } })
    const saved = (await alice.api.get('/auth/me')).data.preferences
    assert.equal(saved.notifications.types.tasks, true)
    assert.equal(saved.notifications.types.events, true, 'sibling type should survive')
    assert.equal(saved.notifications.quietHours.enabled, true, 'quiet hours should survive')
    assert.equal(saved.notifications.leadDays.exams, 7, 'lead days should survive')

    await alice.api.patch('/auth/preferences', { assistant: { finance: false } })
    const privacy = (await alice.api.get('/auth/me')).data.preferences.assistant
    assert.equal(privacy.finance, false)
    assert.equal(privacy.habits, true, 'sibling category should survive')
  })

  test('preferences come back after logging in again', async () => {
    const res = await client(server.base).post('/auth/login', { email: alice.email, password: alice.password })
    assert.equal(res.data.user.preferences.palette, 'sakura')
  })

  test('invalid values, unknown keys and empty bodies are rejected without changing anything', async () => {
    for (const body of [
      { palette: 'neon' },
      { mode: 'auto' },
      { radius: 'huge' },
      { textSize: 99 },
      { evil: 'x' },
      { palette: 'ocean', extra: 1 },
      {},
      { timezone: 'Mars/Olympus' },
      { weekStartsOn: 'tuesday' },
      { currencySymbol: 'XYZ' },
      { dateFormat: 'yolo' },
      { timeFormat: '13h' },
      { focusMode: 'party' },
      { dashboard: { widgets: [{ id: 'tasks', visible: 'yes' }] } },
      { dashboard: { widgets: [{ id: 'tasks', visible: true }, { id: 'tasks', visible: false }] } },
      { notifications: { quietHours: { enabled: true, start: '25:00' } } },
      { notifications: { leadDays: { tasks: -1 } } },
      { assistant: { tasks: 'yes' } },
      { assistant: { notes: true } },
    ]) {
      const res = await alice.api.patch('/auth/preferences', body)
      assert.equal(res.status, 400, JSON.stringify(body))
    }
    assert.equal((await alice.api.get('/auth/me')).data.preferences.palette, 'sakura')
  })

  test("one user's preferences never affect another's", async () => {
    assert.deepEqual((await bob.api.get('/auth/me')).data.preferences, {})
    await bob.api.patch('/auth/preferences', { palette: 'matcha' })
    assert.equal((await alice.api.get('/auth/me')).data.preferences.palette, 'sakura')
  })

  test('requires authentication', async () => {
    assert.equal((await client(server.base).patch('/auth/preferences', { palette: 'sakura' })).status, 401)
  })
})
