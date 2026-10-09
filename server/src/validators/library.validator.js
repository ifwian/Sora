import { z } from 'zod'

const rating = z.number().int().min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5').nullable().optional()
const notes = z.string().max(2000).nullable().optional()
const title = z.string().trim().min(1, 'Title is required').max(200)

const gameFields = {
  title,
  status: z.enum(['PLAYING', 'COMPLETED', 'BACKLOG', 'WISHLIST']).optional(),
  platform: z.string().max(50).nullable().optional(),
  rating,
  notes,
}
export const createGameSchema = z.object(gameFields)
export const updateGameSchema = z.object(gameFields).partial()

const bookFields = {
  title,
  author: z.string().max(100).nullable().optional(),
  status: z.enum(['READING', 'COMPLETED', 'WANT_TO_READ']).optional(),
  totalPages: z.number().int().min(1).max(100000).nullable().optional(),
  currentPage: z.number().int().min(0).max(100000).optional(),
  rating,
  notes,
}
export const createBookSchema = z.object(bookFields)
export const updateBookSchema = z.object(bookFields).partial()

const movieFields = {
  title,
  kind: z.enum(['Movie', 'Series']).optional(),
  status: z.enum(['WATCHING', 'COMPLETED', 'WATCHLIST']).optional(),
  rating,
  notes,
}
export const createMovieSchema = z.object(movieFields)
export const updateMovieSchema = z.object(movieFields).partial()
