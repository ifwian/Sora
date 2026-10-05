import { z } from 'zod'

const baseNoteFields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().max(20000).optional(),
  tags: z.array(z.string().max(30)).max(20).optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
}

export const createNoteSchema = z.object(baseNoteFields)
export const updateNoteSchema = z.object(baseNoteFields).partial()
