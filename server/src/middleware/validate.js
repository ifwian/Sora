import { ApiError } from '../utils/ApiError.js'

/** validateBody — generic middleware factory: validates req.body against a zod schema. */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ')
      return next(new ApiError(400, message))
    }
    req.body = result.data
    next()
  }
}
