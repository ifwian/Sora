import { Router } from 'express'
import healthRoutes from './health.routes.js'

const router = Router()

router.use('/health', healthRoutes)

// Feature routes (tasks, notes, events, auth, ...) get mounted here
// starting Milestone 10, as each module connects to the backend.

export default router
