import { DEMO_USER_ID } from '../config/constants.js'

/**
 * tempUser — TEMPORARY stand-in for real authentication.
 *
 * Every request is treated as the seeded demo user. This exists so
 * Tasks/Notes/Calendar (Milestones 10–12) can connect to the real
 * database before auth (Milestone 13) exists. Milestone 13 replaces
 * this entirely with JWT verification that sets req.userId from a
 * real logged-in session — every controller already reads req.userId,
 * so nothing downstream needs to change when that happens.
 */
export function tempUser(req, res, next) {
  req.userId = DEMO_USER_ID
  next()
}
