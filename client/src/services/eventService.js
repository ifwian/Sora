import { api } from './api'

export const eventService = {
  getEvents: () => api.get('/events'),
  createEvent: (event) => api.post('/events', event),
  updateEvent: (id, updates) => api.patch(`/events/${id}`, updates),
  deleteEvent: (id) => api.delete(`/events/${id}`),
}
