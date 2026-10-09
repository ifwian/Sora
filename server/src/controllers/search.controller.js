import { z } from 'zod'
import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { toDateOnly } from '../utils/serializeDate.js'

const PER_TYPE_LIMIT = 5

const clip = (text, length = 80) => (text && text.length > length ? `${text.slice(0, length)}…` : (text ?? ''))

/**
 * What's searchable. `fields` are matched case-insensitively (substring);
 * `tagField` (optional) matches an exact tag. `to` is the frontend route
 * where the item lives. Add a module here to include it in search.
 */
const SOURCES = [
  { label: 'Tasks', model: 'task', fields: ['title', 'description'], tagField: 'tags', to: '/tasks', title: (r) => r.title, subtitle: (r) => r.status.replace('_', ' ').toLowerCase() },
  { label: 'Notes', model: 'note', fields: ['title', 'content'], tagField: 'tags', to: '/notes', title: (r) => r.title, subtitle: (r) => clip(r.content) },
  { label: 'Calendar', model: 'event', fields: ['title', 'description', 'location'], to: '/calendar', title: (r) => r.title, subtitle: (r) => toDateOnly(r.date) },
  { label: 'Habits', model: 'habit', fields: ['name'], to: '/habits', title: (r) => r.name, subtitle: (r) => r.category ?? '' },
  { label: 'Goals', model: 'goal', fields: ['title', 'description'], to: '/goals', title: (r) => r.title, subtitle: (r) => r.category ?? '' },
  { label: 'Study — subjects', model: 'subject', fields: ['name', 'code'], to: '/study', title: (r) => r.name, subtitle: (r) => r.code ?? '' },
  { label: 'Study — assignments', model: 'assignment', fields: ['title'], to: '/study', title: (r) => r.title, subtitle: (r) => `${r.kind.toLowerCase()} · due ${toDateOnly(r.dueDate)}` },
  { label: 'Finance', model: 'expense', fields: ['description', 'category'], to: '/finance', title: (r) => r.description || r.category, subtitle: (r) => `${r.category} · ${toDateOnly(r.date)}` },
  { label: 'Games', model: 'game', fields: ['title', 'platform'], to: '/games', title: (r) => r.title, subtitle: (r) => r.status.toLowerCase() },
  { label: 'Reading', model: 'book', fields: ['title', 'author'], to: '/reading', title: (r) => r.title, subtitle: (r) => r.author ?? '' },
  { label: 'Movies', model: 'movie', fields: ['title'], to: '/movies', title: (r) => r.title, subtitle: (r) => r.kind },
  { label: 'Memories', model: 'memory', fields: ['title', 'description', 'location'], tagField: 'tags', to: '/memories', title: (r) => r.title, subtitle: (r) => toDateOnly(r.date) },
  { label: 'Places', model: 'place', fields: ['name', 'location'], to: '/places', title: (r) => r.name, subtitle: (r) => r.location ?? '' },
]

const querySchema = z.string().trim().min(2, 'Type at least 2 characters').max(100)

/** GET /api/search?q=... — grouped results across every module, scoped to the current user. */
export const search = asyncHandler(async (req, res) => {
  // Missing or repeated (?q=a&q=b) params are treated as an empty query.
  const parsed = querySchema.safeParse(typeof req.query.q === 'string' ? req.query.q : '')
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0].message)
  }
  const q = parsed.data

  const groups = await Promise.all(
    SOURCES.map(async (source) => {
      const or = source.fields.map((field) => ({ [field]: { contains: q, mode: 'insensitive' } }))
      if (source.tagField) or.push({ [source.tagField]: { has: q.toLowerCase() } })

      const rows = await prisma[source.model].findMany({
        where: { userId: req.userId, OR: or },
        take: PER_TYPE_LIMIT,
      })

      return {
        label: source.label,
        to: source.to,
        results: rows.map((row) => ({ id: row.id, title: source.title(row), subtitle: source.subtitle(row) })),
      }
    })
  )

  res.json({ success: true, data: groups.filter((group) => group.results.length > 0) })
})
