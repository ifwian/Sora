import { z } from 'zod'

const baseGoalFields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  deadline: z.string().date().nullable().optional(),
  completed: z.boolean().optional(),
}

export const createGoalSchema = z.object(baseGoalFields)
export const updateGoalSchema = z.object(baseGoalFields).partial()

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
})

export const updateMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
})
