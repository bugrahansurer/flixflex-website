const DATABASE_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_URL",
] as const

export type DatabaseUrlKey = (typeof DATABASE_URL_KEYS)[number]

export function resolveDatabaseUrl(
  source: NodeJS.ProcessEnv = process.env,
): string | undefined {
  for (const key of DATABASE_URL_KEYS) {
    const value = source[key]?.trim()
    if (value) return value
  }

  return undefined
}

export function normalizeDatabaseUrlEnv(
  source: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const databaseUrl = resolveDatabaseUrl(source)
  if (databaseUrl && !source.DATABASE_URL) {
    source.DATABASE_URL = databaseUrl
  }

  return databaseUrl
}

export const databaseUrlKeys = DATABASE_URL_KEYS
