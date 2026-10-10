import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { chat } from '../controllers/assistant.controller.js'
import { chatSchema } from '../validators/assistant.validator.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

// Every message costs money, so cap it per user (requireAuth runs first and sets req.userId).
const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  keyGenerator: (req) => req.userId,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You've sent a lot of messages — please wait a few minutes." },
})

router.post('/chat', assistantLimiter, validateBody(chatSchema), chat)

export default router
