import { api } from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
  /** Saves appearance settings to the account. Returns the updated user. */
  updatePreferences: (patch) => api.patch('/auth/preferences', patch),
  /** Everything the account owns, as one JSON-safe object. */
  exportData: () => api.get('/auth/export'),
  /** Password-confirmed, irreversible account deletion. */
  deleteAccount: (data) => api.delete('/auth/account', data),
}
