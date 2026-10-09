import { api } from './api'

export const searchService = {
  search: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
}
