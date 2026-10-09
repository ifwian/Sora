import { createCrudRouter } from '../utils/crud.js'
import {
  createMemorySchema,
  updateMemorySchema,
  createPlaceSchema,
  updatePlaceSchema,
} from '../validators/memory.validator.js'

export const memoryRouter = createCrudRouter({
  model: 'memory',
  label: 'Memory',
  createSchema: createMemorySchema,
  updateSchema: updateMemorySchema,
  dateFields: ['date'],
  orderBy: { date: 'desc' },
})

export const placeRouter = createCrudRouter({
  model: 'place',
  label: 'Place',
  createSchema: createPlaceSchema,
  updateSchema: updatePlaceSchema,
  dateFields: ['visitedDate'],
  orderBy: { updatedAt: 'desc' },
})
