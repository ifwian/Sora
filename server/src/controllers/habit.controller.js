import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { toDateOnly } from '../utils/serializeDate.js'

function serializeHabit(habit) {
  return {
    id: habit.id,
    name: habit.name,
    category: habit.category,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
    userId: habit.userId,
    completedDates: (habit.completions ?? []).map((c) => toDateOnly(c.date)),
  }
}

/** GET /api/habits — all habits + their completion dates. */
export const getHabits = asyncHandler(async (req, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.userId },
    include: { completions: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ success: true, data: habits.map(serializeHabit) })
})

export const createHabit = asyncHandler(async (req, res) => {
  const habit = await prisma.habit.create({
    data: { ...req.body, userId: req.userId },
    include: { completions: true },
  })
  res.status(201).json({ success: true, data: serializeHabit(habit) })
})

async function findOwnedHabit(id, userId) {
  const habit = await prisma.habit.findUnique({ where: { id } })
  if (!habit || habit.userId !== userId) {
    throw new ApiError(404, 'Habit not found')
  }
  return habit
}

export const updateHabit = asyncHandler(async (req, res) => {
  await findOwnedHabit(req.params.id, req.userId)
  const habit = await prisma.habit.update({
    where: { id: req.params.id },
    data: req.body,
    include: { completions: true },
  })
  res.json({ success: true, data: serializeHabit(habit) })
})

export const deleteHabit = asyncHandler(async (req, res) => {
  await findOwnedHabit(req.params.id, req.userId)
  await prisma.habit.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: null })
})

/** POST /api/habits/:id/toggle — toggle completion for a given date. */
export const toggleCompletion = asyncHandler(async (req, res) => {
  await findOwnedHabit(req.params.id, req.userId)
  const { date } = req.body

  const existing = await prisma.habitCompletion.findUnique({
    where: { habitId_date: { habitId: req.params.id, date } },
  })

  if (existing) {
    await prisma.habitCompletion.delete({ where: { id: existing.id } })
  } else {
    await prisma.habitCompletion.create({ data: { habitId: req.params.id, date } })
  }

  const habit = await prisma.habit.findUnique({
    where: { id: req.params.id },
    include: { completions: true },
  })
  res.json({ success: true, data: serializeHabit(habit) })
})
