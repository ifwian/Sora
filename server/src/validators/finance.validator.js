import { z } from 'zod'

const expenseFields = {
  amount: z.number().gt(0, 'Amount must be greater than 0').max(100000000),
  category: z.string().trim().min(1, 'Category is required').max(50),
  description: z.string().max(500).nullable().optional(),
  date: z.string().date('date must be YYYY-MM-DD'),
}
export const createExpenseSchema = z.object(expenseFields)
export const updateExpenseSchema = z.object(expenseFields).partial()

const budgetFields = {
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
  amount: z.number().min(0, 'Budget cannot be negative').max(100000000),
}
export const createBudgetSchema = z.object(budgetFields)
export const updateBudgetSchema = z.object(budgetFields).partial()
