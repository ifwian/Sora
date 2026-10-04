import { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller.js'
import { validateBody, createTaskSchema, updateTaskSchema } from '../validators/task.validator.js'

const router = Router()

router.get('/', getTasks)
router.post('/', validateBody(createTaskSchema), createTask)
router.patch('/:id', validateBody(updateTaskSchema), updateTask)
router.delete('/:id', deleteTask)

export default router
