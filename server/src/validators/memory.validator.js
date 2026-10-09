import { z } from 'zod'

// Only http(s) image links — never javascript:, data:, or other schemes.
const photoUrl = z
  .string()
  .max(2000)
  .refine((value) => /^https?:\/\//i.test(value) && URL.canParse(value), 'Photo links must be valid http(s) URLs')

const photos = z.array(photoUrl).max(12, 'At most 12 photos').optional()
const tags = z.array(z.string().trim().min(1).max(30)).max(20).optional()

const memoryFields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(5000).nullable().optional(),
  date: z.string().date('date must be YYYY-MM-DD'),
  location: z.string().max(200).nullable().optional(),
  tags,
  photos,
}
export const createMemorySchema = z.object(memoryFields)
export const updateMemorySchema = z.object(memoryFields).partial()

const placeFields = {
  name: z.string().trim().min(1, 'Name is required').max(200),
  location: z.string().max(200).nullable().optional(),
  visitedDate: z.string().date('visitedDate must be YYYY-MM-DD').nullable().optional(),
  rating: z.number().int().min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5').nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  photos,
}
export const createPlaceSchema = z.object(placeFields)
export const updatePlaceSchema = z.object(placeFields).partial()
