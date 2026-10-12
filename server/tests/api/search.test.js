import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { registerUser, startServer, today } from '../helpers/server.js'

describe('global search', () => {
  let server, alice, bob
  const needle = `zq${Date.now().toString(36)}` // unique so leftovers from earlier runs can't interfere

  before(async () => {
    server = await startServer()
    alice = await registerUser(server.base, 'alice')
    bob = await registerUser(server.base, 'bob')

    await alice.api.post('/tasks', { title: `Finish ${needle} assignment`, tags: ['database'] })
    await alice.api.post('/notes', { title: 'Joins', content: `INNER JOIN notes about ${needle}` })
    await alice.api.post('/events', { title: `${needle} laboratory`, date: today() })
    await alice.api.post('/study/subjects', { name: `${needle} Management`, code: 'CS301' })
    await alice.api.post('/tasks', { title: '100% done review' })
    await bob.api.post('/tasks', { title: `${needle} secret of bob` })
  })
  after(() => server.close())

  test('finds matches across modules, grouped, case-insensitively', async () => {
    const res = await alice.api.get(`/search?q=${needle.toUpperCase()}`)
    assert.equal(res.status, 200)
    const labels = res.data.map((group) => group.label)
    for (const expected of ['Tasks', 'Notes', 'Calendar', 'Study — subjects']) assert.ok(labels.includes(expected), `${expected} in ${labels}`)
    const tasks = res.data.find((g) => g.label === 'Tasks')
    assert.equal(tasks.to, '/tasks')
    assert.ok(tasks.results[0].id && tasks.results[0].title)
  })

  test("never returns another user's data", async () => {
    const mine = JSON.stringify((await alice.api.get(`/search?q=${needle}`)).data)
    assert.ok(!mine.includes('secret of bob'))
    const theirs = (await bob.api.get(`/search?q=${needle}`)).data
    assert.equal(theirs.length, 1)
    assert.equal(theirs[0].results.length, 1)
    assert.equal(theirs[0].results[0].title, `${needle} secret of bob`)
  })

  test('matches exact tags', async () => {
    const res = await alice.api.get('/search?q=database')
    assert.ok(res.data.some((g) => g.label === 'Tasks'))
  })

  test('% and _ are literal characters, not wildcards', async () => {
    const literal = (await alice.api.get('/search?q=0%25')).data // "0%"
    assert.equal(literal.flatMap((g) => g.results).filter((r) => !r.title.includes('0%')).length, 0)
    assert.equal((await alice.api.get('/search?q=%25%25')).data.length, 0)
    assert.equal((await alice.api.get('/search?q=_z')).data.length, 0)
  })

  test('validation: too short, missing, repeated, too long', async () => {
    assert.equal((await alice.api.get('/search?q=a')).status, 400)
    assert.equal((await alice.api.get('/search')).status, 400)
    assert.equal((await alice.api.get('/search?q=ab&q=cd')).status, 400)
    assert.equal((await alice.api.get(`/search?q=${'x'.repeat(101)}`)).status, 400)
  })

  test('no match returns an empty list', async () => {
    const res = await alice.api.get('/search?q=qqqqnomatchqqqq')
    assert.equal(res.status, 200)
    assert.deepEqual(res.data, [])
  })
})
