import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

export const app = express()

// Security headers
app.use(helmet())

// Only allow the frontend's origin to call this API
app.use(cors({ origin: env.clientOrigin }))

// Parse JSON request bodies
app.use(express.json())

// Request logging — concise in production, verbose in development
app.use(morgan(env.isProduction ? 'combined' : 'dev'))

// General rate limit across the whole API
app.use('/api', apiLimiter)

// Routes
app.use('/api', routes)

// 404 + centralized error handling — must be last
app.use(notFound)
app.use(errorHandler)
