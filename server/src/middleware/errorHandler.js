import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

/** notFound — catches any request that didn't match a route. */
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

/**
 * errorHandler — centralized error handling. Every error, expected or
 * not, ends up here and gets turned into a predictable JSON response.
 * Stack traces are only included outside production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Prisma unique-constraint violation (e.g. a second budget for the same month)
  if (err.code === 'P2002') {
    err = new ApiError(409, 'That already exists')
  }

  const statusCode = err.statusCode ?? 500
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again.'

  if (!err.isOperational) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isProduction ? {} : { stack: err.stack }),
  })
}
