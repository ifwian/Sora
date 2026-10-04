import { z } from 'zod'
import { ApiError } from '../utils/ApiError.js'

const STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'COMPLETED']
const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const RECURRING_VALUES = ['DAILY', 'WEEKLY', 'MONTHLY']

const baseTaskFields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  category: z.string().max(50).nullable().optional(),
  tags: z.array(z.string().max(30)).max(20).optional(),
  dueDate: z.string().date().nullable().optional(),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'dueTime must be HH:MM')
    .nullable()
    .optional(),
  recurringFrequency: z.enum(RECURRING_VALUES).nullable().optional(),
}

export const createTaskSchema = z.object(baseTaskFields)

export const updateTaskSchema = z.object(baseTaskFields).partial()

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
