import { Router } from 'express'
import { createCrudRouter } from '../utils/crud.js'
import {
  createExpenseSchema,
  updateExpenseSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from '../validators/finance.validator.js'

const router = Router()

router.use(
  '/expenses',
  createCrudRouter({
    model: 'expense',
    label: 'Expense',
    createSchema: createExpenseSchema,
    updateSchema: updateExpenseSchema,
    dateFields: ['date'],
    numberFields: ['amount'],
    orderBy: { date: 'desc' },
  })
)
router.use(
  '/budgets',
  createCrudRouter({
    model: 'budget',
    label: 'Budget',
    createSchema: createBudgetSchema,
    updateSchema: updateBudgetSchema,
    numberFields: ['amount'],
    orderBy: { month: 'desc' },
  })
)

export default router
