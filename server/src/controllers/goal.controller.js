import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { toDateOnly } from '../utils/serializeDate.js'

function serializeGoal(goal) {
  return { ...goal, deadline: toDateOnly(goal.deadline), milestones: goal.milestones ?? [] }
}

export const getGoals = asyncHandler(async (req, res) => {
  const goals = await prisma.goal.findMany({
    where: { userId: req.userId },
    include: { milestones: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ success: true, data: goals.map(serializeGoal) })
})

export const createGoal = asyncHandler(async (req, res) => {
  const goal = await prisma.goal.create({
    data: { ...req.body, userId: req.userId },
    include: { milestones: true },
  })
  res.status(201).json({ success: true, data: serializeGoal(goal) })
})

async function findOwnedGoal(id, userId) {
  const goal = await prisma.goal.findUnique({ where: { id } })
  if (!goal || goal.userId !== userId) {
    throw new ApiError(404, 'Goal not found')
  }
  return goal
}

export const updateGoal = asyncHandler(async (req, res) => {
  await findOwnedGoal(req.params.id, req.userId)
  const goal = await prisma.goal.update({
    where: { id: req.params.id },
    data: req.body,
    include: { milestones: { orderBy: { order: 'asc' } } },
  })
  res.json({ success: true, data: serializeGoal(goal) })
})

export const deleteGoal = asyncHandler(async (req, res) => {
  await findOwnedGoal(req.params.id, req.userId)
  await prisma.goal.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: null })
})

/** POST /api/goals/:id/milestones — add a milestone to a goal. */
export const addMilestone = asyncHandler(async (req, res) => {
  await findOwnedGoal(req.params.id, req.userId)
  const count = await prisma.goalMilestone.count({ where: { goalId: req.params.id } })
  await prisma.goalMilestone.create({
    data: { ...req.body, goalId: req.params.id, order: count },
  })
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.id },
    include: { milestones: { orderBy: { order: 'asc' } } },
  })
  res.status(201).json({ success: true, data: serializeGoal(goal) })
})

/** PATCH /api/goals/:goalId/milestones/:milestoneId — toggle/rename a milestone. */
export const updateMilestone = asyncHandler(async (req, res) => {
  const goal = await findOwnedGoal(req.params.goalId, req.userId)
  const milestone = await prisma.goalMilestone.findUnique({ where: { id: req.params.milestoneId } })
  if (!milestone || milestone.goalId !== goal.id) {
    throw new ApiError(404, 'Milestone not found')
  }
  await prisma.goalMilestone.update({ where: { id: req.params.milestoneId }, data: req.body })
  const updatedGoal = await prisma.goal.findUnique({
    where: { id: req.params.goalId },
    include: { milestones: { orderBy: { order: 'asc' } } },
  })
  res.json({ success: true, data: serializeGoal(updatedGoal) })
})

/** DELETE /api/goals/:goalId/milestones/:milestoneId */
export const deleteMilestone = asyncHandler(async (req, res) => {
  const goal = await findOwnedGoal(req.params.goalId, req.userId)
  const milestone = await prisma.goalMilestone.findUnique({ where: { id: req.params.milestoneId } })
  if (!milestone || milestone.goalId !== goal.id) {
    throw new ApiError(404, 'Milestone not found')
  }
  await prisma.goalMilestone.delete({ where: { id: req.params.milestoneId } })
  const updatedGoal = await prisma.goal.findUnique({
    where: { id: req.params.goalId },
    include: { milestones: { orderBy: { order: 'asc' } } },
  })
  res.json({ success: true, data: serializeGoal(updatedGoal) })
})
