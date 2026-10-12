import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { registerUser, startServer, today } from '../helpers/server.js'

describe('tasks', () => {
  let server, alice, bob

  before(async () => {
    server = await startServer()
    alice = await registerUser(server.base, 'alice')
    bob = await registerUser(server.base, 'bob')
  })
  after(() => server.close())

  test('create applies defaults and returns plain YYYY-MM-DD dates', async () => {
    const res = await alice.api.post('/tasks', { title: '  Finish SQL  ', dueDate: '2026-10-05', dueTime: '17:00', tags: ['sql'] })
    assert.equal(res.status, 201)
    assert.equal(res.data.title, 'Finish SQL') // trimmed
    assert.equal(res.data.status, 'TODO')
    assert.equal(res.data.priority, 'MEDIUM')
    assert.equal(res.data.dueDate, '2026-10-05')
    assert.deepEqual(res.data.tags, ['sql'])
    assert.equal(res.data.completedAt, null)
  })

  test('validation: empty title, bad enums, bad time, bad date, bad recurring', async () => {
    for (const body of [{ title: '' }, { title: 'x', priority: 'SUPER' }, { title: 'x', status: 'DONE' }, { title: 'x', dueTime: '25:99' }, { title: 'x', dueDate: 'tomorrow' }, { title: 'x', recurringFrequency: 'YEARLY' }]) {
      const res = await alice.api.post('/tasks', body)
      assert.equal(res.status, 400, JSON.stringify(body))
    }
  })

  test('completedAt is server-controlled: set on completion, kept on re-save, cleared on reopen, never forgeable', async () => {
    const created = await alice.api.post('/tasks', { title: 'Lifecycle', completedAt: '2020-01-01T00:00:00Z' })
    assert.equal(created.data.completedAt, null, 'client-supplied completedAt must be ignored')

    const done = await alice.api.patch(`/tasks/${created.data.id}`, { status: 'COMPLETED' })
    assert.ok(done.data.completedAt)

    const resaved = await alice.api.patch(`/tasks/${created.data.id}`, { status: 'COMPLETED', title: 'Lifecycle renamed' })
    assert.equal(resaved.data.completedAt, done.data.completedAt)

    const edited = await alice.api.patch(`/tasks/${created.data.id}`, { title: 'No status in this edit' })
    assert.equal(edited.data.completedAt, done.data.completedAt)

    const reopened = await alice.api.patch(`/tasks/${created.data.id}`, { status: 'TODO' })
    assert.equal(reopened.data.completedAt, null)

    const bornDone = await alice.api.post('/tasks', { title: 'Born done', status: 'COMPLETED' })
    assert.ok(bornDone.data.completedAt)
  })

  test('update + delete work, and deleted tasks are gone', async () => {
    const { data } = await alice.api.post('/tasks', { title: 'Temp' })
    const updated = await alice.api.patch(`/tasks/${data.id}`, { priority: 'URGENT', dueDate: today() })
    assert.equal(updated.data.priority, 'URGENT')
    assert.equal((await alice.api.del(`/tasks/${data.id}`)).status, 200)
    const list = await alice.api.get('/tasks')
    assert.ok(!list.data.some((t) => t.id === data.id))
    assert.equal((await alice.api.patch(`/tasks/${data.id}`, { title: 'ghost' })).status, 404)
  })

  test('isolation: another user cannot see, edit or delete my tasks', async () => {
    const { data } = await alice.api.post('/tasks', { title: 'Alice private' })
    assert.ok(!(await bob.api.get('/tasks')).data.some((t) => t.id === data.id))
    assert.equal((await bob.api.patch(`/tasks/${data.id}`, { title: 'hijacked' })).status, 404)
    assert.equal((await bob.api.del(`/tasks/${data.id}`)).status, 404)
    const still = (await alice.api.get('/tasks')).data.find((t) => t.id === data.id)
    assert.equal(still.title, 'Alice private')
  })

  test('mass assignment: userId and id in the body are ignored', async () => {
    const res = await alice.api.post('/tasks', { title: 'Mine', userId: bob.id, id: 'forced-id' })
    assert.equal(res.data.userId, alice.id)
    assert.notEqual(res.data.id, 'forced-id')
    const patched = await alice.api.patch(`/tasks/${res.data.id}`, { title: 'Still mine', userId: bob.id })
    assert.equal(patched.data.userId, alice.id)
    assert.ok(!(await bob.api.get('/tasks')).data.some((t) => t.id === res.data.id))
  })

  test('a PATCH that changes nothing (empty, or only unknown/forbidden fields) is rejected with 400', async () => {
    const { data } = await alice.api.post('/tasks', { title: 'Untouched' })
    for (const body of [{}, { userId: bob.id }, { foo: 'bar' }]) {
      const res = await alice.api.patch(`/tasks/${data.id}`, body)
      assert.equal(res.status, 400, JSON.stringify(body))
      assert.match(res.body.message, /No valid fields/)
    }
    const after = (await alice.api.get('/tasks')).data.find((t) => t.id === data.id)
    assert.equal(after.userId, alice.id)
  })
})
