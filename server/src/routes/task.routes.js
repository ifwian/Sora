import { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller.js'
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

router.get('/', getTasks)
router.post('/', validateBody(createTaskSchema), createTask)
router.patch('/:id', validateBody(updateTaskSchema), updateTask)
router.delete('/:id', deleteTask)

export default router
