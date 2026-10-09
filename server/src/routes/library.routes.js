import { Router } from 'express'
import { createCrudRouter } from '../utils/crud.js'
import {
  createGameSchema,
  updateGameSchema,
  createBookSchema,
  updateBookSchema,
  createMovieSchema,
  updateMovieSchema,
} from '../validators/library.validator.js'

const router = Router()

router.use(
  '/games',
  createCrudRouter({ model: 'game', label: 'Game', createSchema: createGameSchema, updateSchema: updateGameSchema, orderBy: { updatedAt: 'desc' } })
)
router.use(
  '/books',
  createCrudRouter({ model: 'book', label: 'Book', createSchema: createBookSchema, updateSchema: updateBookSchema, orderBy: { updatedAt: 'desc' } })
)
router.use(
  '/movies',
  createCrudRouter({ model: 'movie', label: 'Movie', createSchema: createMovieSchema, updateSchema: updateMovieSchema, orderBy: { updatedAt: 'desc' } })
)

export default router
