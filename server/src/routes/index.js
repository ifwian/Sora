import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import taskRoutes from './task.routes.js'
import noteRoutes from './note.routes.js'
import eventRoutes from './event.routes.js'
import habitRoutes from './habit.routes.js'
import goalRoutes from './goal.routes.js'
import studyRoutes from './study.routes.js'
import financeRoutes from './finance.routes.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

// Public
router.use('/health', healthRoutes)
router.use('/auth', authRoutes)

// Protected — every route below requires a valid Bearer token
router.use('/tasks', requireAuth, taskRoutes)
router.use('/notes', requireAuth, noteRoutes)
router.use('/events', requireAuth, eventRoutes)
router.use('/habits', requireAuth, habitRoutes)
router.use('/goals', requireAuth, goalRoutes)
router.use('/study', requireAuth, studyRoutes)
router.use('/finance', requireAuth, financeRoutes)

// Remaining feature routes (study, finance, ...) get mounted here,
// protected the same way, as each module connects to the backend.

export default router
