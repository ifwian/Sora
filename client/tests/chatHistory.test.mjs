import assert from 'node:assert/strict'
import { test } from 'node:test'
import { trimHistory, MAX_HISTORY } from '../src/utils/chatHistory.js'

const turns = (n) => Array.from({ length: n }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: String(i) }))

test('short conversations are untouched', () => {
  assert.deepEqual(trimHistory(turns(3)), turns(3))
})

test('long conversations are trimmed to the limit and always start with a user turn', () => {
  const trimmed = trimHistory(turns(30))
  assert.ok(trimmed.length <= MAX_HISTORY)
  assert.equal(trimmed[0].role, 'user')
  assert.equal(trimmed.at(-1).content, '29')
})

test('never returns an assistant-first conversation, even if that empties it', () => {
  assert.deepEqual(trimHistory([{ role: 'assistant', content: 'x' }]), [])
})
