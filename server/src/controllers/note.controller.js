import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.userId },
    orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
  })
  res.json({ success: true, data: notes })
})

export const createNote = asyncHandler(async (req, res) => {
  const note = await prisma.note.create({
    data: { ...req.body, userId: req.userId },
  })
  res.status(201).json({ success: true, data: note })
})

async function findOwnedNote(id, userId) {
  const note = await prisma.note.findUnique({ where: { id } })
  if (!note || note.userId !== userId) {
    throw new ApiError(404, 'Note not found')
  }
  return note
}

export const updateNote = asyncHandler(async (req, res) => {
  await findOwnedNote(req.params.id, req.userId)
  const note = await prisma.note.update({ where: { id: req.params.id }, data: req.body })
  res.json({ success: true, data: note })
})

export const deleteNote = asyncHandler(async (req, res) => {
  await findOwnedNote(req.params.id, req.userId)
  await prisma.note.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: null })
})
