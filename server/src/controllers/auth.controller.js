import bcrypt from 'bcrypt'
import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/jwt.js'

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

/** PATCH /api/auth/preferences — merge appearance settings into the user's saved preferences. */
export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) throw new ApiError(401, 'Invalid or expired session')

  const updated = await prisma.user.update({
    where: { id: req.userId },
    data: { preferences: { ...(user.preferences ?? {}), ...req.body } },
  })
  res.json({ success: true, data: serializeUser(updated) })
})
