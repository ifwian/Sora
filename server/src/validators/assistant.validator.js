import { z } from 'zod'

export const chatSchema = z.object({
  // The browser's local date, so "today" and "this week" match the user's timezone.
  today: z.string().date('today must be YYYY-MM-DD'),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1, 'Message cannot be empty').max(4000, 'Message is too long'),
      })
    )
    .min(1)
    .max(20, 'Conversation is too long — start a new chat')
    .refine((messages) => messages[0]?.role === 'user', 'Conversation must start with a user message')
    .refine((messages) => messages.at(-1)?.role === 'user', 'Last message must be from the user'),
})
