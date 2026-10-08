import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { ApiError } from './ApiError.js'
import { asyncHandler } from './asyncHandler.js'
import { toDateOnly } from './serializeDate.js'
import { validateBody } from '../middleware/validate.js'

/**
 * createCrudRouter — builds list/create/update/delete routes for a model
 * that has a `userId` column. Every query is scoped to req.userId, so a
 * user can never read or change another user's rows.
 *
 * Options:
 *  model          Prisma delegate name, e.g. 'expense'
 *  label          Used in error messages, e.g. 'Expense'
 *  createSchema / updateSchema   zod schemas for request bodies
 *  dateFields     DATE columns to serialize as 'YYYY-MM-DD'
 *  numberFields   Decimal columns to serialize as JS numbers
 *  orderBy        Prisma orderBy for the list endpoint
 *  parent         { field, model, label } — a foreign key that must point
 *                 to a row owned by the same user (e.g. an assignment's subject)
 */
export function createCrudRouter({
  model,
  label,
  createSchema,
  updateSchema,
  dateFields = [],
  numberFields = [],
  orderBy,
  parent,
}) {
  const router = Router()

  const serialize = (row) => {
    const out = { ...row }
    for (const field of dateFields) out[field] = toDateOnly(row[field])
    for (const field of numberFields) out[field] = row[field] == null ? null : Number(row[field])
    return out
  }

  async function assertParentOwned(body, userId) {
    const parentId = parent && body[parent.field]
    if (!parentId) return
    const found = await prisma[parent.model].findUnique({ where: { id: parentId } })
    if (!found || found.userId !== userId) {
      throw new ApiError(400, `${parent.label} not found`)
    }
  }

  async function findOwned(id, userId) {
    const row = await prisma[model].findUnique({ where: { id } })
    if (!row || row.userId !== userId) throw new ApiError(404, `${label} not found`)
    return row
  }

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const rows = await prisma[model].findMany({ where: { userId: req.userId }, orderBy })
      res.json({ success: true, data: rows.map(serialize) })
    })
  )

  router.post(
    '/',
    validateBody(createSchema),
    asyncHandler(async (req, res) => {
      await assertParentOwned(req.body, req.userId)
      const row = await prisma[model].create({ data: { ...req.body, userId: req.userId } })
      res.status(201).json({ success: true, data: serialize(row) })
    })
  )

  router.patch(
    '/:id',
    validateBody(updateSchema),
    asyncHandler(async (req, res) => {
      await findOwned(req.params.id, req.userId)
      await assertParentOwned(req.body, req.userId)
      const row = await prisma[model].update({ where: { id: req.params.id }, data: req.body })
      res.json({ success: true, data: serialize(row) })
    })
  )

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await findOwned(req.params.id, req.userId)
      await prisma[model].delete({ where: { id: req.params.id } })
      res.json({ success: true, data: null })
    })
  )

  return router
}
