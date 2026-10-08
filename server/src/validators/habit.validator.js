import { z } from 'zod'

const baseHabitFields = {
  name: z.string().trim().min(1, 'Name is required').max(100),
  category: z.string().max(50).nullable().optional(),
}

export const createHabitSchema = z.object(baseHabitFields)
export const updateHabitSchema = z.object(baseHabitFields).partial()
export const toggleCompletionSchema = z.object({
  date: z.string().date('date must be YYYY-MM-DD'),
})
