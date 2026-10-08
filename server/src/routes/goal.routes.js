import { Router } from 'express'
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  updateMilestone,
  deleteMilestone,
} from '../controllers/goal.controller.js'
import {
  createGoalSchema,
  updateGoalSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
} from '../validators/goal.validator.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

router.get('/', getGoals)
router.post('/', validateBody(createGoalSchema), createGoal)
router.patch('/:id', validateBody(updateGoalSchema), updateGoal)
router.delete('/:id', deleteGoal)

router.post('/:id/milestones', validateBody(createMilestoneSchema), addMilestone)
router.patch('/:goalId/milestones/:milestoneId', validateBody(updateMilestoneSchema), updateMilestone)
router.delete('/:goalId/milestones/:milestoneId', deleteMilestone)

export default router
