import { api } from './api'

export const goalService = {
  getGoals: () => api.get('/goals'),
  createGoal: (goal) => api.post('/goals', goal),
  updateGoal: (id, updates) => api.patch(`/goals/${id}`, updates),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  addMilestone: (goalId, title) => api.post(`/goals/${goalId}/milestones`, { title }),
  updateMilestone: (goalId, milestoneId, updates) =>
    api.patch(`/goals/${goalId}/milestones/${milestoneId}`, updates),
  deleteMilestone: (goalId, milestoneId) => api.delete(`/goals/${goalId}/milestones/${milestoneId}`),
}
