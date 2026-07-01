import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"
import { normalizeDatabaseUrlEnv } from "@/lib/database-url"

const databaseUrl = normalizeDatabaseUrlEnv()
const hasDbUrl = Boolean(databaseUrl)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

// Force global state to be null if DB URL is missing (cleans up potential dirty state from hot-reloads)
if (!hasDbUrl) {
  globalForPrisma.prisma = null
}

// Prisma Postgres is reached through Accelerate (external connection pooling)
// via a `prisma+postgres://` / `prisma://` DATABASE_URL. This fixes the
// connection-limit exhaustion of the low-limit direct connection. Migrations
// still use the direct connection through DIRECT_URL (see prisma/schema.prisma).
//
// The extension is applied at RUNTIME but the value is typed as the base
// PrismaClient: withAccelerate only ADDS methods (cacheStrategy) and keeps all
// base query typing — the extended type otherwise degrades `include` relation
// inference across the codebase. We don't use cacheStrategy, so the base type
// is both correct and complete.
const createPrisma = (): PrismaClient =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate()) as unknown as PrismaClient

export const prisma: PrismaClient | null =
  globalForPrisma.prisma ?? (hasDbUrl ? createPrisma() : null)

if (process.env.NODE_ENV !== "production" && hasDbUrl) {
  globalForPrisma.prisma = prisma
}

export default prisma
