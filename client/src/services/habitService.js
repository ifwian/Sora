import { api } from './api'

export const habitService = {
  getHabits: () => api.get('/habits'),
  createHabit: (habit) => api.post('/habits', habit),
  updateHabit: (id, updates) => api.patch(`/habits/${id}`, updates),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  toggleCompletion: (id, date) => api.post(`/habits/${id}/toggle`, { date }),
}
