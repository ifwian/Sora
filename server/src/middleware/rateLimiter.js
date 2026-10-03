import rateLimit from 'express-rate-limit'

/**
 * apiLimiter — generous general-purpose limit for the whole API.
 * Stricter limits (e.g. for login) get added alongside auth in Milestone 13.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})
