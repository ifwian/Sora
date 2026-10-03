import { PrismaClient } from '@prisma/client'

/**
 * Single shared PrismaClient instance. Import this everywhere instead of
 * creating `new PrismaClient()` per file, which would exhaust database
 * connections.
 */
export const prisma = new PrismaClient()
