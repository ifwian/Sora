import { ApiError } from '../utils/ApiError.js'
import { verifyToken } from '../utils/jwt.js'

/**
 * requireAuth — verifies the Authorization: Bearer <token> header and
 * sets req.userId. Replaces the temporary middleware/tempUser.js from
 * Milestones 10–12 — every controller already reads req.userId, so
 * nothing downstream needed to change.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return next(new ApiError(401, 'Not authenticated'))
  }

  const userId = verifyToken(token)
  if (!userId) {
    return next(new ApiError(401, 'Invalid or expired session'))
  }

  req.userId = userId
  next()
}
