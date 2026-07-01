import { PrismaClient } from "@prisma/client"
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

// Standart Postgres (Neon). DATABASE_URL = havuzlanmış bağlantı (host'ta -pooler),
// DIRECT_URL = migration'lar için doğrudan bağlantı (bkz. prisma/schema.prisma).
// Neon'un PgBouncer havuzu eşzamanlı bağlantıları yönetir → ayrı bir Accelerate
// katmanına gerek yok.
const createPrisma = (): PrismaClient =>
  new PrismaClient({
    // Sadece "warn": DB kesintisinde "query"+"error" seviyeleri terminali sele
    // boğuyordu; gerçek hatalar uygulama katmanındaki try/catch'lerde loglanıyor.
    log: process.env.NODE_ENV === "development" ? ["warn"] : ["error"],
  })

export const prisma: PrismaClient | null =
  globalForPrisma.prisma ?? (hasDbUrl ? createPrisma() : null)

if (process.env.NODE_ENV !== "production" && hasDbUrl) {
  globalForPrisma.prisma = prisma
}

export default prisma
