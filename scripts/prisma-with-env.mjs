#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { join } from "node:path"

// Yalnızca DATABASE_URL — eski entegrasyonun POSTGRES_*/PRISMA_ değişkenleri
// (db.prisma.io) migration/seed'i yanlış DB'ye yönlendirmesin.
const databaseUrlKeys = [
  "DATABASE_URL",
]

function parseEnvFile(path) {
  if (!existsSync(path)) return {}

  const output = {}
  const lines = readFileSync(path, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const index = trimmed.indexOf("=")
    if (index === -1) continue

    const key = trimmed.slice(0, index).trim().replace(/^export\s+/, "")
    let value = trimmed.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    output[key] = value
  }

  return output
}

const fileEnv = {
  ...parseEnvFile(".env"),
  ...parseEnvFile(".env.local"),
}

const env = {
  ...fileEnv,
  ...process.env,
}

const databaseUrl = databaseUrlKeys.map((key) => env[key]?.trim()).find(Boolean)

if (!databaseUrl) {
  console.error(
    `DATABASE_URL bulunamadı. Şunlardan biri set edilmeli: ${databaseUrlKeys.join(", ")}`,
  )
  process.exit(1)
}

env.DATABASE_URL = databaseUrl

const prismaBin = join(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
)

const command = existsSync(prismaBin) ? prismaBin : "npx"
const args = existsSync(prismaBin) ? process.argv.slice(2) : ["prisma", ...process.argv.slice(2)]

const result = spawnSync(command, args, {
  env,
  stdio: "inherit",
  shell: true,
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 0)
