import { api } from './api'

export const taskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, updates) => api.patch(`/tasks/${id}`, updates),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
}
