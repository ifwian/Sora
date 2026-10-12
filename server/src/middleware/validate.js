import { ApiError } from '../utils/ApiError.js'

/** validateBody — generic middleware factory: validates req.body against a zod schema. */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ')
      return next(new ApiError(400, message))
    }

    // A PATCH that validates but changes nothing (e.g. only unknown fields, which zod strips)
    // is almost certainly a client mistake — say so instead of silently doing nothing.
    if (req.method === 'PATCH' && Object.keys(result.data).length === 0) {
      return next(new ApiError(400, 'No valid fields to update'))
    }

    req.body = result.data
    next()
  }
}
