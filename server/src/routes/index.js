import { Router } from 'express'
import healthRoutes from './health.routes.js'
import taskRoutes from './task.routes.js'
import noteRoutes from './note.routes.js'
import eventRoutes from './event.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/tasks', taskRoutes)
router.use('/notes', noteRoutes)
router.use('/events', eventRoutes)

// Remaining feature routes (auth, habits, goals, ...) get mounted here
// as each module connects to the backend in its own milestone.

export default router
