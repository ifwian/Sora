import { AUTH_TOKEN_KEY } from '../constants/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

/**
 * ApiRequestError — thrown when the API responds with success: false.
 * Carries the server's message so callers/UI can show it directly.
 */
export class ApiRequestError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

/**
 * request — shared fetch wrapper. Every API call goes through this, so
 * JSON parsing, the base URL, the auth header, and 401 handling all
 * live in one place.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => null)

  if (response.status === 401 && token) {
    // The session is invalid/expired — clear it and let AuthContext know,
    // so the person gets redirected to log in again instead of seeing
    // confusing errors on every subsequent request.
    localStorage.removeItem(AUTH_TOKEN_KEY)
    window.dispatchEvent(new Event('auth:logout'))
  }

  if (!response.ok || !body?.success) {
    throw new ApiRequestError(body?.message ?? 'Something went wrong. Please try again.', response.status)
  }

  return body.data
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
