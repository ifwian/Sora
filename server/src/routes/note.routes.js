import { Router } from 'express'
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/note.controller.js'
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

router.get('/', getNotes)
router.post('/', validateBody(createNoteSchema), createNote)
router.patch('/:id', validateBody(updateNoteSchema), updateNote)
router.delete('/:id', deleteNote)

export default router
