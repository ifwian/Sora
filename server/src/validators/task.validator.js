import { z } from 'zod'

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
