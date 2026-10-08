import { api } from './api'

/** createResourceService — standard list/create/update/remove calls for a REST collection. */
export function createResourceService(basePath) {
  return {
    list: () => api.get(basePath),
    create: (data) => api.post(basePath, data),
    update: (id, data) => api.patch(`${basePath}/${id}`, data),
    remove: (id) => api.delete(`${basePath}/${id}`),
  }
}
