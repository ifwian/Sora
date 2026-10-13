import { prisma } from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { coerceDates, toDateOnly } from '../utils/serializeDate.js'

const DATE_FIELDS = ['date']

function serializeEvent(event) {
  return { ...event, date: toDateOnly(event.date) }
}

export const getEvents = asyncHandler(async (req, res) => {
  const events = await prisma.event.findMany({
    where: { userId: req.userId },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })
  res.json({ success: true, data: events.map(serializeEvent) })
})

export const createEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.create({
    data: { ...coerceDates(req.body, DATE_FIELDS), userId: req.userId },
  })
  res.status(201).json({ success: true, data: serializeEvent(event) })
})

async function findOwnedEvent(id, userId) {
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event || event.userId !== userId) {
    throw new ApiError(404, 'Event not found')
  }
  return event
}

export const updateEvent = asyncHandler(async (req, res) => {
  await findOwnedEvent(req.params.id, req.userId)
  const event = await prisma.event.update({ where: { id: req.params.id }, data: coerceDates(req.body, DATE_FIELDS) })
  res.json({ success: true, data: serializeEvent(event) })
})

export const deleteEvent = asyncHandler(async (req, res) => {
  await findOwnedEvent(req.params.id, req.userId)
  await prisma.event.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: null })
})
