import { Router } from 'express'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller.js'
import { createEventSchema, updateEventSchema } from '../validators/event.validator.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

router.get('/', getEvents)
router.post('/', validateBody(createEventSchema), createEvent)
router.patch('/:id', validateBody(updateEventSchema), updateEvent)
router.delete('/:id', deleteEvent)

export default router
