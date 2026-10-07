import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
}

/** Returns the userId from a valid token, or null if invalid/expired. */
export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    return payload.sub
  } catch {
    return null
  }
}
