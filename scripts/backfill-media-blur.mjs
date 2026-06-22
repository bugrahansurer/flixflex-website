#!/usr/bin/env node
/**
 * scripts/backfill-media-blur.mjs
 *
 * Backfills width, height, and blurDataUrl for existing Media rows that are
 * missing compression metadata. Processes only "image" type rows with a real
 * http(s) URL. Does NOT re-upload or modify the stored Blob — metadata only.
 *
 * Usage:
 *   node scripts/backfill-media-blur.mjs           # live run
 *   node scripts/backfill-media-blur.mjs --dry-run # report only, no writes
 *
 * Environment: reads DATABASE_URL (or POSTGRES_PRISMA_URL / POSTGRES_URL /
 * PRISMA_DATABASE_URL) from .env and .env.local (same resolution order as
 * scripts/prisma-with-env.mjs).
 */

import { existsSync, readFileSync } from "node:fs"
import { PrismaClient } from "@prisma/client"
import sharp from "sharp"

// ── Env loading (mirrors prisma-with-env.mjs) ──────────────────────────────

const databaseUrlKeys = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_URL",
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
const env = { ...fileEnv, ...process.env }
const databaseUrl = databaseUrlKeys.map((k) => env[k]?.trim()).find(Boolean)

if (!databaseUrl) {
  console.error(
    `[backfill] DATABASE_URL not found. Set one of: ${databaseUrlKeys.join(", ")}`,
  )
  process.exit(1)
}

process.env.DATABASE_URL = databaseUrl

// ── CLI flags ──────────────────────────────────────────────────────────────

const isDryRun = process.argv.includes("--dry-run")
if (isDryRun) {
  console.log("[backfill] DRY RUN — no database writes will occur.")
}

// ── Config ─────────────────────────────────────────────────────────────────

const BATCH_SIZE = 20
/** Mirror the pixel-bomb guard from the upload route. */
const SHARP_PIXEL_LIMIT = 100_000_000

// ── Blur generation (mirrors upload route's generateBlur exactly) ──────────

/**
 * @param {Buffer} buf
 * @returns {Promise<string | null>}
 */
async function generateBlur(buf) {
  try {
    const tiny = await sharp(buf, { limitInputPixels: SHARP_PIXEL_LIMIT })
      .resize(16, 16, { fit: "inside" })
      .webp({ quality: 50 })
      .toBuffer()
    return `data:image/webp;base64,${tiny.toString("base64")}`
  } catch {
    return null
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

const prisma = new PrismaClient()

async function main() {
  // Count candidates first for progress reporting
  const total = await prisma.media.count({
    where: {
      type: "image",
      url: { startsWith: "http" },
      OR: [
        { blurDataUrl: null },
        { width: null },
        { height: null },
      ],
    },
  })

  if (total === 0) {
    console.log("[backfill] No images need backfilling. Done.")
    return
  }

  console.log(`[backfill] Found ${total} image(s) to process.`)

  let processed = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  let cursor: string | undefined = undefined

  while (true) {
    const batch = await prisma.media.findMany({
      where: {
        type: "image",
        url: { startsWith: "http" },
        OR: [
          { blurDataUrl: null },
          { width: null },
          { height: null },
        ],
      },
      select: { id: true, url: true, title: true },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
    })

    if (batch.length === 0) break

    for (const row of batch) {
      processed++
      cursor = row.id

      try {
        // Skip non-http URLs (mux asset URLs, relative paths, etc.)
        if (!row.url.startsWith("http")) {
          console.log(`[backfill] ${processed}/${total} SKIP  (non-http url) id=${row.id}`)
          skipped++
          continue
        }

        // Fetch image bytes
        const res = await fetch(row.url)
        if (!res.ok) {
          console.warn(
            `[backfill] ${processed}/${total} SKIP  (fetch ${res.status}) id=${row.id} url=${row.url}`,
          )
          skipped++
          continue
        }

        const arrayBuf = await res.arrayBuffer()
        const buf = Buffer.from(arrayBuf)

        // Extract metadata via sharp
        const meta = await sharp(buf, { limitInputPixels: SHARP_PIXEL_LIMIT }).metadata()
        const width = meta.width ?? null
        const height = meta.height ?? null

        // Generate blur placeholder
        const blurDataUrl = await generateBlur(buf)

        if (isDryRun) {
          console.log(
            `[backfill] ${processed}/${total} DRY   id=${row.id} title="${row.title}" → ${width}x${height} blur=${blurDataUrl ? "yes" : "no"}`,
          )
          updated++
          continue
        }

        await prisma.media.update({
          where: { id: row.id },
          data: { width, height, blurDataUrl },
        })

        console.log(
          `[backfill] ${processed}/${total} OK    id=${row.id} title="${row.title}" → ${width}x${height} blur=${blurDataUrl ? "yes" : "no"}`,
        )
        updated++
      } catch (err) {
        console.error(
          `[backfill] ${processed}/${total} ERROR id=${row.id}:`,
          err instanceof Error ? err.message : String(err),
        )
        failed++
      }
    }

    // Re-query the next batch using cursor pagination (safe on large tables)
  }

  const action = isDryRun ? "would update" : "updated"
  console.log(
    `\n[backfill] Done. ${action}=${updated}, skipped=${skipped}, failed=${failed} (of ${total} candidates)`,
  )
}

main()
  .catch((err) => {
    console.error("[backfill] Fatal error:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
