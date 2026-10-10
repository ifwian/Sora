import { api } from './api'
import { todayISO } from '../utils/date'

export const assistantService = {
  /** Sends the conversation plus the browser's local date, so "today" matches the user's timezone. */
  chat: (messages) => api.post('/assistant/chat', { today: todayISO(), messages }).then((data) => data.reply),
}
