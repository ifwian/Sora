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
export const env = {
  port: Number(requireEnv('PORT', '5000')),
  nodeEnv: requireEnv('NODE_ENV', 'development'),
  clientOrigin: requireEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: requireEnv('JWT_EXPIRES_IN', '7d'),
  // Optional — the Assistant is disabled (with a clear message) when no key is set.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || undefined,
  isProduction: process.env.NODE_ENV === 'production',
}
