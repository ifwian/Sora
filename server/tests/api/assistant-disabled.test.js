import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { registerUser, startServer, today } from '../helpers/server.js'

describe('assistant without an API key', () => {
  let app, alice

  before(async () => {
    app = await startServer({ ANTHROPIC_API_KEY: '' })
    alice = await registerUser(app.base, 'alice')
  })
  after(() => app.close())

  test('responds with a clear setup message (503), not a crash', async () => {
    const res = await alice.api.post('/assistant/chat', { today: today(), messages: [{ role: 'user', content: 'hi' }] })
    assert.equal(res.status, 503)
    assert.match(res.body.message, /ANTHROPIC_API_KEY/)
  })
})
