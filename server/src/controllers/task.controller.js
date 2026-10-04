import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/** GET /api/tasks — all tasks belonging to the current user. */
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  })
  res.json({ success: true, data: tasks })
})

/** POST /api/tasks — create a task for the current user. */
export const createTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.create({
    data: { ...req.body, userId: req.userId },
  })
  res.status(201).json({ success: true, data: task })
})

/** Shared helper — loads a task and throws 404 if missing or not owned by this user. */
async function findOwnedTask(id, userId) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.userId !== userId) {
    throw new ApiError(404, 'Task not found')
  }
  return task
}

/** PATCH /api/tasks/:id — update a task. */
export const updateTask = asyncHandler(async (req, res) => {
  await findOwnedTask(req.params.id, req.userId)
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json({ success: true, data: task })
})

/** DELETE /api/tasks/:id — delete a task. */
export const deleteTask = asyncHandler(async (req, res) => {
  await findOwnedTask(req.params.id, req.userId)
  await prisma.task.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: null })
})
