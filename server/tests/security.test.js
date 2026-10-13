// Security-focused unit tests. These need no database.
process.env.DATABASE_URL = 'postgresql://unused:unused@localhost:5432/unused'
process.env.JWT_SECRET = 'test-secret-that-is-definitely-long-enough-123456'

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import jwt from 'jsonwebtoken'

const { signToken, verifyToken } = await import('../src/utils/jwt.js')
const SECRET = process.env.JWT_SECRET

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')

test('a token we signed verifies and returns its user id', () => {
  assert.equal(verifyToken(signToken('user-123')), 'user-123')
})

test('rejects a token signed with a different secret', () => {
  const forged = jwt.sign({ sub: 'user-123' }, 'some-other-secret', { algorithm: 'HS256' })
  assert.equal(verifyToken(forged), null)
})

test('rejects an unsigned "alg: none" token', () => {
  const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'user-123' })}.`
  assert.equal(verifyToken(none), null)
})

test('rejects a token using a different algorithm, even with the right secret (algorithm is pinned)', () => {
  const hs512 = jwt.sign({ sub: 'user-123' }, SECRET, { algorithm: 'HS512' })
  assert.equal(verifyToken(hs512), null)
})

test('rejects an expired token', () => {
  const expired = jwt.sign({ sub: 'user-123' }, SECRET, { algorithm: 'HS256', expiresIn: -10 })
  assert.equal(verifyToken(expired), null)
})

test('rejects a token whose subject is not a string', () => {
  assert.equal(verifyToken(jwt.sign({ sub: { $ne: null } }, SECRET, { algorithm: 'HS256' })), null)
  assert.equal(verifyToken(jwt.sign({ nosub: true }, SECRET, { algorithm: 'HS256' })), null)
})

test('rejects garbage and empty input', () => {
  for (const junk of ['', 'abc', 'a.b.c', 'Bearer x', '....']) assert.equal(verifyToken(junk), null)
})

// --- env.js startup checks, run in a child process so each case gets a clean environment
// fileURLToPath is required here: URL#pathname yields "/D:/..." on Windows, which is not a
// valid cwd, so spawnSync would fail before env.js ever loaded.
const SERVER_DIR = fileURLToPath(new URL('..', import.meta.url))

function loadEnv(vars) {
  return spawnSync(
    process.execPath,
    ['--input-type=module', '-e', "const { env } = await import('./src/config/env.js'); console.log(JSON.stringify({ origin: env.clientOrigin, proxy: env.trustProxy }))"],
    { cwd: SERVER_DIR, env: { DATABASE_URL: 'x', ...vars }, encoding: 'utf8' }
  )
}

test('production refuses to start with a short JWT_SECRET', () => {
  const result = loadEnv({ NODE_ENV: 'production', JWT_SECRET: 'short' })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /JWT_SECRET must be a random string of at least 32 characters/)
})

test('production refuses to start with the .env.example placeholder secret', () => {
  const result = loadEnv({ NODE_ENV: 'production', JWT_SECRET: 'replace-with-a-long-random-string' })
  assert.notEqual(result.status, 0)
})

test('production starts with a strong secret; trailing slash on CLIENT_ORIGIN is stripped; trust proxy is read', () => {
  const result = loadEnv({
    NODE_ENV: 'production',
    JWT_SECRET: 'x'.repeat(48),
    CLIENT_ORIGIN: 'https://myapp.vercel.app///',
    TRUST_PROXY: '1',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), { origin: 'https://myapp.vercel.app', proxy: 1 })
})

test('development with a short secret still starts (only production is strict)', () => {
  const result = loadEnv({ NODE_ENV: 'development', JWT_SECRET: 'short' })
  assert.equal(result.status, 0, result.stderr)
})
