import 'dotenv/config'

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * env — single source of truth for configuration.
 * Import this instead of reading process.env directly elsewhere,
 * so every required variable is validated in one place at startup.
 */
const PLACEHOLDER_SECRET = 'replace-with-a-long-random-string'
const isProduction = process.env.NODE_ENV === 'production'
const jwtSecret = requireEnv('JWT_SECRET')

if (isProduction && (jwtSecret.length < 32 || jwtSecret === PLACEHOLDER_SECRET)) {
  throw new Error('JWT_SECRET must be a random string of at least 32 characters in production.')
}
if (!isProduction && jwtSecret === PLACEHOLDER_SECRET) {
  console.warn('[security] JWT_SECRET is still the placeholder from .env.example — generate a real one.')
}

export const env = {
  port: Number(requireEnv('PORT', '5000')),
  nodeEnv: requireEnv('NODE_ENV', 'development'),
  // CORS compares origins exactly, so a stray trailing slash would silently break every request.
  clientOrigin: requireEnv('CLIENT_ORIGIN', 'http://localhost:5173').replace(/\/+$/, ''),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret,
  jwtExpiresIn: requireEnv('JWT_EXPIRES_IN', '7d'),
  // Optional — the Assistant is disabled (with a clear message) when no key is set.
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  // Only for tests: lets the suite point the SDK at a local mock server instead of Google.
  geminiBaseUrl: process.env.GEMINI_BASE_URL || undefined,
  // Number of reverse proxies in front of the API (Render/Railway = 1). Needed so rate limiting
  // sees each visitor's real IP instead of the proxy's. Leave 0 when running locally.
  trustProxy: Number(process.env.TRUST_PROXY ?? 0),
  isProduction,
}
