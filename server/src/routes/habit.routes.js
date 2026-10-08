import { Router } from 'express'
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleCompletion,
} from '../controllers/habit.controller.js'
import { createHabitSchema, updateHabitSchema, toggleCompletionSchema } from '../validators/habit.validator.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

router.get('/', getHabits)
router.post('/', validateBody(createHabitSchema), createHabit)
router.patch('/:id', validateBody(updateHabitSchema), updateHabit)
router.delete('/:id', deleteHabit)
router.post('/:id/toggle', validateBody(toggleCompletionSchema), toggleCompletion)

export default router
