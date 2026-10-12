import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { registerUser, startServer, today } from '../helpers/server.js'

describe('notes, events, habits, goals', () => {
  let server, alice, bob

  before(async () => {
    server = await startServer()
    alice = await registerUser(server.base, 'alice')
    bob = await registerUser(server.base, 'bob')
  })
  after(() => server.close())

  test('notes: create, pin, archive, tags, and a note with no content defaults to empty', async () => {
    const { data } = await alice.api.post('/notes', { title: 'Cheat sheet', tags: ['sql'] })
    assert.equal(data.content, '')
    assert.equal(data.pinned, false)
    assert.equal((await alice.api.patch(`/notes/${data.id}`, { pinned: true })).data.pinned, true)
    assert.equal((await alice.api.patch(`/notes/${data.id}`, { archived: true })).data.archived, true)
    assert.equal((await alice.api.post('/notes', { title: '' })).status, 400)
  })

  test('events: date comes back as YYYY-MM-DD; bad date/time rejected', async () => {
    const { status, data } = await alice.api.post('/events', { title: 'Lab', date: '2026-10-12', startTime: '09:00', endTime: '10:30', category: 'Class' })
    assert.equal(status, 201)
    assert.equal(data.date, '2026-10-12')
    assert.equal((await alice.api.post('/events', { title: 'x', date: '12/10/2026' })).status, 400)
    assert.equal((await alice.api.post('/events', { title: 'x', date: '2026-10-12', startTime: '9am' })).status, 400)
  })

  test('habits: toggling a date on then off, and the completion list is returned as plain dates', async () => {
    const { data: habit } = await alice.api.post('/habits', { name: 'Coding practice' })
    assert.deepEqual(habit.completedDates, [])
    const on = await alice.api.post(`/habits/${habit.id}/toggle`, { date: today() })
    assert.deepEqual(on.data.completedDates, [today()])
    const off = await alice.api.post(`/habits/${habit.id}/toggle`, { date: today() })
    assert.deepEqual(off.data.completedDates, [])
    assert.equal((await alice.api.post(`/habits/${habit.id}/toggle`, { date: 'nope' })).status, 400)
  })

  test('habits: another user cannot toggle or delete my habit', async () => {
    const { data: habit } = await alice.api.post('/habits', { name: 'Private habit' })
    assert.equal((await bob.api.post(`/habits/${habit.id}/toggle`, { date: today() })).status, 404)
    assert.equal((await bob.api.del(`/habits/${habit.id}`)).status, 404)
  })

  test('goals: milestones can be added, completed and removed; order is preserved', async () => {
    const { data: goal } = await alice.api.post('/goals', { title: 'Learn React', deadline: '2026-12-01' })
    assert.equal(goal.deadline, '2026-12-01')
    await alice.api.post(`/goals/${goal.id}/milestones`, { title: 'Components' })
    const two = await alice.api.post(`/goals/${goal.id}/milestones`, { title: 'Hooks' })
    assert.deepEqual(two.data.milestones.map((m) => m.title), ['Components', 'Hooks'])

    const [first] = two.data.milestones
    const done = await alice.api.patch(`/goals/${goal.id}/milestones/${first.id}`, { completed: true })
    assert.equal(done.data.milestones[0].completed, true)

    const removed = await alice.api.del(`/goals/${goal.id}/milestones/${first.id}`)
    assert.deepEqual(removed.data.milestones.map((m) => m.title), ['Hooks'])
  })

  test("goals: another user cannot touch my goal's milestones", async () => {
    const { data: goal } = await alice.api.post('/goals', { title: 'Mine' })
    const { data: withMs } = await alice.api.post(`/goals/${goal.id}/milestones`, { title: 'Step' })
    const ms = withMs.milestones[0]
    assert.equal((await bob.api.post(`/goals/${goal.id}/milestones`, { title: 'Injected' })).status, 404)
    assert.equal((await bob.api.patch(`/goals/${goal.id}/milestones/${ms.id}`, { completed: true })).status, 404)
    assert.equal((await bob.api.del(`/goals/${goal.id}/milestones/${ms.id}`)).status, 404)
  })

  test("goals: a milestone can't be reached through a different goal's URL", async () => {
    const { data: g1 } = await alice.api.post('/goals', { title: 'G1' })
    const { data: g2 } = await alice.api.post('/goals', { title: 'G2' })
    const { data: withMs } = await alice.api.post(`/goals/${g1.id}/milestones`, { title: 'Belongs to G1' })
    const res = await alice.api.patch(`/goals/${g2.id}/milestones/${withMs.milestones[0].id}`, { completed: true })
    assert.equal(res.status, 404)
  })
})
