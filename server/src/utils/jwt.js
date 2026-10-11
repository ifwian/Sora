import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// Pin the algorithm on both sides. Without this, a verifier can be tricked
// into accepting tokens signed with a different (or no) algorithm.
const ALGORITHM = 'HS256'

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn, algorithm: ALGORITHM })
}

/** Returns the userId from a valid token, or null if invalid/expired. */
export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] })
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}
