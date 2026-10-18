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

  test('preferences come back after logging in again', async () => {
    const res = await client(server.base).post('/auth/login', { email: alice.email, password: alice.password })
    assert.equal(res.data.user.preferences.palette, 'sakura')
  })

  test('invalid values, unknown keys and empty bodies are rejected without changing anything', async () => {
    for (const body of [{ palette: 'neon' }, { mode: 'auto' }, { radius: 'huge' }, { textSize: 99 }, { evil: 'x' }, { palette: 'ocean', extra: 1 }, {}]) {
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
