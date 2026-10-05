import { api } from './api'

export const noteService = {
  getNotes: () => api.get('/notes'),
  createNote: (note) => api.post('/notes', note),
  updateNote: (id, updates) => api.patch(`/notes/${id}`, updates),
  deleteNote: (id) => api.delete(`/notes/${id}`),
}
