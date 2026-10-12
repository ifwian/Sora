import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { client, registerUser, startServer } from '../helpers/server.js'

describe('auth', () => {
  let server, anon, alice

  before(async () => {
    server = await startServer()
    anon = client(server.base)
    alice = await registerUser(server.base, 'alice')
  })
  after(() => server.close())

  test('register returns a token and the user, never the password hash', async () => {
    const res = await anon.post('/auth/register', { email: `new-${Date.now()}@example.test`, password: 'password123' })
    assert.equal(res.status, 201)
    assert.ok(res.data.token)
    assert.equal(res.data.user.passwordHash, undefined)
    assert.ok(!JSON.stringify(res.body).includes('passwordHash'))
  })

  test('rejects a duplicate email (409), a weak password (400) and a bad email (400)', async () => {
    assert.equal((await anon.post('/auth/register', { email: alice.email, password: 'password123' })).status, 409)
    assert.equal((await anon.post('/auth/register', { email: 'weak@example.test', password: 'short' })).status, 400)
    assert.equal((await anon.post('/auth/register', { email: 'not-an-email', password: 'password123' })).status, 400)
  })

  test('emails are case-insensitive', async () => {
    const res = await anon.post('/auth/login', { email: alice.email.toUpperCase(), password: alice.password })
    assert.equal(res.status, 200)
  })

  test('login works, and a wrong password / unknown email give the SAME generic error', async () => {
    assert.equal((await anon.post('/auth/login', { email: alice.email, password: alice.password })).status, 200)
    const wrong = await anon.post('/auth/login', { email: alice.email, password: 'wrong-password' })
    const unknown = await anon.post('/auth/login', { email: 'nobody@example.test', password: 'whatever123' })
    assert.equal(wrong.status, 401)
    assert.equal(unknown.status, 401)
    assert.equal(wrong.body.message, unknown.body.message)
  })

  test('/me needs a valid token', async () => {
    assert.equal((await anon.get('/auth/me')).status, 401)
    assert.equal((await client(server.base, 'garbage.token.here').get('/auth/me')).status, 401)
    const me = await alice.api.get('/auth/me')
    assert.equal(me.status, 200)
    assert.equal(me.data.email, alice.email)
  })

  test('every data route rejects requests without a token', async () => {
    for (const path of ['/tasks', '/notes', '/events', '/habits', '/goals', '/study/subjects', '/finance/expenses', '/library/games', '/memories', '/places', '/search?q=ab']) {
      assert.equal((await anon.get(path)).status, 401, path)
    }
  })

  test('change password: wrong current is refused; success invalidates the old password', async () => {
    const user = await registerUser(server.base, 'changer')
    assert.equal((await user.api.patch('/auth/change-password', { currentPassword: 'nope-nope', newPassword: 'brand-new-pass' })).status, 400)
    assert.equal((await user.api.patch('/auth/change-password', { currentPassword: user.password, newPassword: 'short' })).status, 400)
    assert.equal((await user.api.patch('/auth/change-password', { currentPassword: user.password, newPassword: 'brand-new-pass' })).status, 200)
    assert.equal((await anon.post('/auth/login', { email: user.email, password: user.password })).status, 401)
    assert.equal((await anon.post('/auth/login', { email: user.email, password: 'brand-new-pass' })).status, 200)
  })

  test('unknown routes are 404 (not 401), in the standard error shape', async () => {
    const res = await anon.get('/definitely-not-a-route')
    assert.equal(res.status, 404)
    assert.equal(res.body.success, false)
  })
})
