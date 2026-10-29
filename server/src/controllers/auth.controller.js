import bcrypt from 'bcrypt'
import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/jwt.js'

import { toDateOnly } from '../utils/serializeDate.js'

const SALT_ROUNDS = 10

// Compared against when the email doesn't exist, so a login for an unknown
// email takes as long as one for a real account (no timing side-channel).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS)

function serializeUser(user) {
  return { id: user.id, email: user.email, name: user.name, preferences: user.preferences ?? {}, createdAt: user.createdAt }
}

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({ data: { email, passwordHash, name } })

  const token = signToken(user.id)
  res.status(201).json({ success: true, data: { user: serializeUser(user), token } })
})

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  // Same generic message whether the email doesn't exist or the password
  // is wrong — never reveal which one it was.
  const invalidCredentials = () => new ApiError(401, 'Invalid email or password')

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !passwordMatches) throw invalidCredentials()

  const token = signToken(user.id)
  res.json({ success: true, data: { user: serializeUser(user), token } })
})

/** GET /api/auth/me — requires auth */
export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) throw new ApiError(401, 'Invalid or expired session')
  res.json({ success: true, data: serializeUser(user) })
})

/** PATCH /api/auth/change-password — requires auth */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) throw new ApiError(401, 'Invalid or expired session')

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!passwordMatches) throw new ApiError(400, 'Current password is incorrect')

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } })

  res.json({ success: true, data: null })
})

/** Recursively merges plain objects so a patch to one settings group doesn't wipe its siblings. Arrays are replaced. */
function mergePreferences(base, patch) {
  const isPlain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
  if (!isPlain(base) || !isPlain(patch)) return patch
  const merged = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    merged[key] = isPlain(value) && isPlain(merged[key]) ? mergePreferences(merged[key], value) : value
  }
  return merged
}

/** GET /api/auth/export — everything the signed-in user owns, as one JSON document. Never includes the password hash. */
export const exportData = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) throw new ApiError(401, 'Invalid or expired session')

  const [tasks, notes, events, habits, goals, subjects, assignments, sessions, grades, expenses, budgets, games, books, movies, memories, places] =
    await Promise.all([
      prisma.task.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
      prisma.note.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
      prisma.event.findMany({ where: { userId: req.userId }, orderBy: { date: 'asc' } }),
      prisma.habit.findMany({ where: { userId: req.userId }, include: { completions: true }, orderBy: { createdAt: 'asc' } }),
      prisma.goal.findMany({ where: { userId: req.userId }, include: { milestones: { orderBy: { order: 'asc' } } }, orderBy: { createdAt: 'asc' } }),
      prisma.subject.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
      prisma.assignment.findMany({ where: { userId: req.userId }, orderBy: { dueDate: 'asc' } }),
      prisma.studySession.findMany({ where: { userId: req.userId }, orderBy: { date: 'asc' } }),
      prisma.grade.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
      prisma.expense.findMany({ where: { userId: req.userId }, orderBy: { date: 'asc' } }),
      prisma.budget.findMany({ where: { userId: req.userId }, orderBy: { month: 'asc' } }),
      prisma.game.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
      prisma.book.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
      prisma.movie.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
      prisma.memory.findMany({ where: { userId: req.userId }, orderBy: { date: 'asc' } }),
      prisma.place.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } }),
    ])

  const withDates = (rows, fields) =>
    rows.map((row) => ({ ...row, ...Object.fromEntries(fields.filter((field) => field in row).map((field) => [field, toDateOnly(row[field])])) }))

  res.json({
    success: true,
    data: {
      format: 'sora-export',
      version: 1,
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences ?? {},
        createdAt: user.createdAt,
      },
      tasks: withDates(tasks, ['dueDate']),
      notes,
      events: withDates(events, ['date']),
      habits: habits.map((habit) => ({ ...habit, completions: withDates(habit.completions, ['date']) })),
      goals: withDates(goals, ['deadline']),
      study: {
        subjects,
        assignments: withDates(assignments, ['dueDate']),
        sessions: withDates(sessions, ['date']),
        grades,
      },
      finance: {
        expenses: withDates(expenses, ['date']).map((expense) => ({ ...expense, amount: Number(expense.amount) })),
        budgets: budgets.map((budget) => ({ ...budget, amount: Number(budget.amount) })),
      },
      library: { games, books, movies },
      memories: withDates(memories, ['date']),
      places: withDates(places, ['visitedDate']),
    },
  })
})

/** DELETE /api/auth/account — password-confirmed, cascades every row owned by the user. */
export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) throw new ApiError(401, 'Invalid or expired session')

  const passwordMatches = await bcrypt.compare(req.body.password, user.passwordHash)
  if (!passwordMatches) throw new ApiError(400, 'Password is incorrect')

  await prisma.user.delete({ where: { id: req.userId } })
  res.json({ success: true, data: null })
})

/** PATCH /api/auth/preferences — merge settings into the user's saved preferences. */
export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) throw new ApiError(401, 'Invalid or expired session')

  const updated = await prisma.user.update({
    where: { id: req.userId },
    data: { preferences: mergePreferences(user.preferences ?? {}, req.body) },
  })
  res.json({ success: true, data: serializeUser(updated) })
})
