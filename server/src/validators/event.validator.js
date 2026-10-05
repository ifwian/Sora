import { z } from 'zod'

const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time must be HH:MM')
  .nullable()
  .optional()

const baseEventFields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  category: z.string().max(50).optional(),
  date: z.string().date('date must be YYYY-MM-DD'),
  startTime: timeField,
  endTime: timeField,
}

export const createEventSchema = z.object(baseEventFields)
export const updateEventSchema = z.object(baseEventFields).partial()
