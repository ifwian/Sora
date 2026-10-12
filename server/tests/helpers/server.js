// Shared helpers for the API tests. They drive the real Express app over HTTP,
// so they exercise routing, validation, auth and the database exactly as in production.

const TEST_ENV = {
  NODE_ENV: 'test',
  JWT_SECRET: `test-secret-${'x'.repeat(40)}`,
  CLIENT_ORIGIN: 'http://localhost:5173',
}

/** Starts the app on a random port. Refuses to touch anything that doesn't look like a test database. */
export async function startServer(extraEnv = {}) {
  const dbName = (process.env.DATABASE_URL ?? '').split('/').pop().split('?')[0]
  if (!/test/i.test(dbName) && process.env.ALLOW_TESTS_ON_ANY_DB !== '1') {
    throw new Error(
      `Refusing to run API tests against database "${dbName}". These tests create users and data — ` +
        'point DATABASE_URL at a database whose name contains "test" (e.g. personal_os_test).'
    )
  }
  Object.assign(process.env, TEST_ENV, extraEnv)

  const { app } = await import('../../src/app.js')
  const { prisma } = await import('../../src/config/prisma.js')
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })

  return {
    base: `http://localhost:${server.address().port}/api`,
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      await prisma.$disconnect?.()
    },
  }
}

/** A tiny JSON client: every call resolves to { status, body, data } and never throws on HTTP errors. */
export function client(base, token) {
  const call = async (method, path, body) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const json = await response.json().catch(() => null)
    return { status: response.status, body: json, data: json?.data }
  }
  return {
    get: (path) => call('GET', path),
    post: (path, body) => call('POST', path, body),
    patch: (path, body) => call('PATCH', path, body),
    del: (path) => call('DELETE', path),
  }
}

/** Registers a brand-new user (unique email each run) and returns a client already signed in as them. */
export async function registerUser(base, label = 'user') {
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`
  const res = await client(base).post('/auth/register', { email, password: 'password123', name: label })
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`)
  return { email, password: 'password123', id: res.data.user.id, token: res.data.token, api: client(base, res.data.token) }
}

export const today = () => new Date().toISOString().slice(0, 10)
