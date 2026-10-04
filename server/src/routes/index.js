import { Router } from 'express'
import healthRoutes from './health.routes.js'
import taskRoutes from './task.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/tasks', taskRoutes)

// Remaining feature routes (notes, events, auth, ...) get mounted here
// as each module connects to the backend in its own milestone.

export default router
