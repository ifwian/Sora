import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, getMe, changePassword, updatePreferences } from '../controllers/auth.controller.js'
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator.js'
import { preferencesSchema } from '../validators/preferences.validator.js'
import { validateBody } from '../middleware/validate.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

// Tighter than the general API limit — login/register are brute-force targets.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
})

router.post('/register', authLimiter, validateBody(registerSchema), register)
router.post('/login', authLimiter, validateBody(loginSchema), login)
router.get('/me', requireAuth, getMe)
router.patch('/preferences', requireAuth, validateBody(preferencesSchema), updatePreferences)
router.patch('/change-password', requireAuth, validateBody(changePasswordSchema), changePassword)

export default router
