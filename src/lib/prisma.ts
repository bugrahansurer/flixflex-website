import { PrismaClient } from "@prisma/client"
import { normalizeDatabaseUrlEnv } from "@/lib/database-url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

const databaseUrl = normalizeDatabaseUrlEnv()
const hasDbUrl = Boolean(databaseUrl)

// Force global state to be null if DB URL is missing (cleans up potential dirty state from hot-reloads)
if (!hasDbUrl) {
  globalForPrisma.prisma = null
}

export const prisma =
  globalForPrisma.prisma ??
  (hasDbUrl
    ? new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      })
    : null)

if (process.env.NODE_ENV !== "production" && hasDbUrl) {
  globalForPrisma.prisma = prisma
}

export default prisma
