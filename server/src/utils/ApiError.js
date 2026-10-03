/**
 * ApiError — throw this from controllers/services for expected,
 * controlled failures (not found, validation, unauthorized, etc.).
 * The centralized error handler knows how to turn this into a
 * predictable JSON response.
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}
