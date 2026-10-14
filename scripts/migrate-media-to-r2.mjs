#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// Tek seferlik geçiş: tüm medyayı R2'ye taşı, linkleri düzelt.
//
//   Vercel Blob görselleri     → indir, R2'ye yükle
//   r2.dev / /media-cdn linkleri → zaten R2'de, sadece link değişir
//   Mux videoları (HLS)        → ffmpeg ile en yüksek kalite MP4 +
//                                poster (WebP), R2'ye yükle
//
// Tüm metin/JSON/dizi kolonlarındaki eski linkler yeni public adresle
// (R2_PUBLIC_BASE_URL) değiştirilir; Mux'lu medya kayıtları MP4'e çevrilir.
//
// Kullanım:
//   node --env-file=.env scripts/migrate-media-to-r2.mjs            # kuru çalıştırma (hiçbir şey yazmaz)
//   NEON_API_KEY=... node --env-file=.env scripts/migrate-media-to-r2.mjs --apply
//
// --apply önce Neon'da yedek branch açar (NEON_API_KEY + NEON_PROJECT_ID
// veya --no-backup). Tekrar çalıştırılabilir: taşınmış linkler eşleşmez.
// Gerekli: ffmpeg / ffprobe PATH'te.
// ═══════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client"
import { AwsClient } from "aws4fetch"
import sharp from "sharp"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { mkdtemp, readFile, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const run = promisify(execFile)
const APPLY = process.argv.includes("--apply")
const NO_BACKUP = process.argv.includes("--no-backup")

const {
  CLOUDFLARE_ACCOUNT_ID: ACC, R2_BUCKET: BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
  R2_PUBLIC_BASE_URL, NEON_API_KEY, NEON_PROJECT_ID = "fancy-bird-14764379",
} = process.env

const BASE = R2_PUBLIC_BASE_URL?.replace(/\/+$/, "")
if (!ACC || !BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !BASE?.startsWith("https://")) {
  console.error("Eksik env: CLOUDFLARE_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_BASE_URL (https://...)")
  process.exit(1)
}

const s3 = new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" })
const objectUrl = (key) => `https://${ACC}.r2.cloudflarestorage.com/${BUCKET}/${key.split("/").map(encodeURIComponent).join("/")}`
const publicUrl = (key) => `${BASE}/${key.split("/").map(encodeURIComponent).join("/")}`
const prisma = new PrismaClient()

// ── Link desenleri ───────────────────────────────────────────
const END = `[^\\s"'\\\\)<>]+`
const PATTERNS = {
  blob:     new RegExp(`https://[a-z0-9]+\\.public\\.blob\\.vercel-storage\\.com/${END}`, "g"),
  r2dev:    new RegExp(`https://pub-[a-z0-9]+\\.r2\\.dev/${END}`, "g"),
  mediaCdn: new RegExp(`/media-cdn/media/${END}`, "g"),
  muxStream: /https:\/\/stream\.mux\.com\/[A-Za-z0-9]+\.m3u8(?:\?[^\s"'\\)<>]*)?/g,
  muxImage: /https:\/\/image\.mux\.com\/[A-Za-z0-9]+\/[^\s"'\\)<>]+/g,
}

function safeName(name) {
  return name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "media"
}
function newKey(baseName, ext) {
  const date = new Date().toISOString().slice(0, 10)
  return `media/${date}/${crypto.randomUUID()}-${safeName(baseName)}${ext ? `.${ext}` : ""}`
}

async function r2Put(key, body, contentType) {
  const res = await s3.fetch(objectUrl(key), { method: "PUT", headers: { "Content-Type": contentType }, body })
  if (!res.ok) throw new Error(`R2 PUT ${res.status} ${key}`)
}
async function r2Exists(key) {
  const res = await s3.fetch(objectUrl(key), { method: "HEAD" })
  return res.ok
}

// ── 1. Tara ──────────────────────────────────────────────────
const columns = await prisma.$queryRawUnsafe(`
  SELECT table_name AS t, column_name AS c, data_type AS dt, udt_name AS udt
  FROM information_schema.columns
  WHERE table_schema = 'public' AND data_type IN ('text','character varying','json','jsonb','ARRAY')
    AND table_name NOT LIKE '\\_%'
`)
const textExpr = (c, dt) => (dt === "ARRAY" ? `array_to_string("${c}", ' ')` : `"${c}"::text`)

const found = new Map() // url -> kind
const hitColumns = []
for (const col of columns) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT ${textExpr(col.c, col.dt)} AS v FROM "${col.t}"
     WHERE ${textExpr(col.c, col.dt)} ~ '(blob\\.vercel-storage\\.com|\\.r2\\.dev/|/media-cdn/|stream\\.mux\\.com|image\\.mux\\.com)'`,
  )
  if (!rows.length) continue
  hitColumns.push({ ...col, rows: rows.length })
  for (const { v } of rows) {
    for (const [kind, re] of Object.entries(PATTERNS)) {
      for (const m of v.matchAll(re)) found.set(m[0], kind)
    }
  }
}

console.log("Etkilenen kolonlar:")
for (const h of hitColumns) console.log(`  ${h.t}.${h.c} (${h.dt}) — ${h.rows} satır`)
const byKind = {}
for (const k of found.values()) byKind[k] = (byKind[k] || 0) + 1
console.log("Bulunan benzersiz linkler:", byKind)

// Mux kayıtları (media tablosu) — playbackId → kayıt
const muxRows = await prisma.media.findMany({
  where: { OR: [{ url: { contains: "stream.mux.com" } }, { muxPlaybackId: { not: null } }] },
})
const playbackIds = new Set([
  ...[...found].filter(([, k]) => k === "muxStream").map(([u]) => u.split("stream.mux.com/")[1].split(".m3u8")[0]),
  ...[...found].filter(([, k]) => k === "muxImage").map(([u]) => u.split("image.mux.com/")[1].split("/")[0]),
  ...muxRows.map((r) => r.muxPlaybackId).filter(Boolean),
])
console.log(`Mux videoları: ${playbackIds.size}`)

if (!APPLY) {
  console.log("\nKuru çalıştırma — hiçbir şey yazılmadı. Uygulamak için --apply.")
  await prisma.$disconnect()
  process.exit(0)
}

// ── 2. Yedek ─────────────────────────────────────────────────
if (!NO_BACKUP) {
  if (!NEON_API_KEY) {
    console.error("NEON_API_KEY yok — yedeksiz çalıştırmak için --no-backup.")
    process.exit(1)
  }
  const proj = `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}`
  const h = { Authorization: `Bearer ${NEON_API_KEY}`, "Content-Type": "application/json", Accept: "application/json" }
  const branches = await fetch(`${proj}/branches`, { headers: h }).then((r) => r.json())
  const parent = branches.branches.find((b) => b.default) ?? branches.branches[0]
  const name = `backup-before-r2-migration-${new Date().toISOString().replace(/[:.]/g, "-")}`
  const res = await fetch(`${proj}/branches`, { method: "POST", headers: h, body: JSON.stringify({ branch: { parent_id: parent.id, name } }) })
  if (!res.ok) throw new Error(`Neon yedek branch açılamadı: ${res.status} ${await res.text()}`)
  console.log(`Yedek branch: ${name}`)
}

// ── 3. Dosyaları taşı, eski→yeni link haritası ───────────────
const map = new Map()
const work = await mkdtemp(join(tmpdir(), "flixflex-migrate-"))

for (const [url, kind] of found) {
  if (kind === "r2dev" || kind === "mediaCdn") {
    const key = decodeURIComponent(kind === "r2dev" ? new URL(url).pathname.slice(1) : url.slice("/media-cdn/".length))
    if (!(await r2Exists(key))) { console.warn(`  ! R2'de yok, atlandı: ${key}`); continue }
    map.set(url, publicUrl(key))
  } else if (kind === "blob") {
    const res = await fetch(url)
    if (!res.ok) { console.warn(`  ! Blob indirilemedi (${res.status}): ${url}`); continue }
    const buf = Buffer.from(await res.arrayBuffer())
    const file = decodeURIComponent(new URL(url).pathname.split("/").pop() || "media")
    const ext = (file.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    const key = newKey(file, ext)
    await r2Put(key, buf, res.headers.get("content-type") || "application/octet-stream")
    map.set(url, publicUrl(key))
    console.log(`  blob → ${key}`)
  }
}

const muxResult = new Map() // playbackId -> { mp4, poster, size, width, height, duration }
for (const id of playbackIds) {
  const mp4 = join(work, `${id}.mp4`)
  const jpg = join(work, `${id}.jpg`)
  console.log(`  mux ${id}: indiriliyor…`)
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", `https://stream.mux.com/${id}.m3u8`,
    "-c", "copy", "-bsf:a", "aac_adtstoasc", "-movflags", "+faststart", mp4], { maxBuffer: 1 << 26 })
  const probe = JSON.parse((await run("ffprobe", ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration", "-of", "json", mp4])).stdout)
  await run("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1", "-i", mp4, "-frames:v", "1", jpg])
  const poster = await sharp(await readFile(jpg)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()

  const row = muxRows.find((r) => r.muxPlaybackId === id || r.url.includes(id))
  const base = row?.title?.replace(/^Mux Video\s*/i, "") || id
  const videoKey = newKey(`video-${base}`, "mp4")
  const posterKey = newKey(`poster-${base}`, "webp")
  const body = await readFile(mp4)
  await r2Put(videoKey, body, "video/mp4")
  await r2Put(posterKey, poster, "image/webp")
  const s = probe.streams?.[0] ?? {}
  muxResult.set(id, {
    mp4: publicUrl(videoKey), poster: publicUrl(posterKey), size: (await stat(mp4)).size,
    width: s.width ?? null, height: s.height ?? null, duration: Number(probe.format?.duration) || null,
  })
  console.log(`  mux ${id} → ${videoKey} (${s.width}x${s.height}, ${((await stat(mp4)).size / 1e6).toFixed(1)} MB)`)
}
for (const [url, kind] of found) {
  if (kind === "muxStream") map.set(url, muxResult.get(url.split("stream.mux.com/")[1].split(".m3u8")[0])?.mp4)
  if (kind === "muxImage") map.set(url, muxResult.get(url.split("image.mux.com/")[1].split("/")[0])?.poster)
}
await rm(work, { recursive: true, force: true })

// ── 4. Linkleri değiştir (uzun olandan kısaya — önek çakışması olmasın) ──
const pairs = [...map].filter(([, v]) => v).sort((a, b) => b[0].length - a[0].length)
let updated = 0
await prisma.$transaction(async (tx) => {
  for (const col of hitColumns) {
    for (const [from, to] of pairs) {
      const set =
        col.dt === "ARRAY" ? `ARRAY(SELECT replace(x, $1, $2) FROM unnest("${col.c}") x)`
        : col.dt === "jsonb" ? `replace("${col.c}"::text, $1, $2)::jsonb`
        : col.dt === "json" ? `replace("${col.c}"::text, $1, $2)::json`
        : `replace("${col.c}", $1, $2)`
      updated += await tx.$executeRawUnsafe(
        `UPDATE "${col.t}" SET "${col.c}" = ${set} WHERE strpos(${textExpr(col.c, col.dt)}, $1) > 0`, from, to,
      )
    }
  }
  // Mux medya kayıtlarını MP4 kaydına çevir
  for (const row of muxRows) {
    const id = row.muxPlaybackId || row.url.split("stream.mux.com/")[1]?.split(".m3u8")[0]
    const r = id && muxResult.get(id)
    if (!r) continue
    await tx.media.update({
      where: { id: row.id },
      data: {
        url: r.mp4, thumbnail: r.poster, mimeType: "video/mp4", size: r.size,
        width: r.width, height: r.height, duration: r.duration,
        muxPlaybackId: null, muxAssetId: null, muxUploadId: null, muxStatus: null,
      },
    })
  }
}, { timeout: 120_000 })

// ── 5. Kontrol: Mux playbackId'leri hâlâ geçiyor mu (çıplak id olarak)? ──
const leftovers = []
for (const id of playbackIds) {
  for (const col of hitColumns) {
    const [{ n }] = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS n FROM "${col.t}" WHERE strpos(${textExpr(col.c, col.dt)}, $1) > 0`, id)
    if (n) leftovers.push(`${col.t}.${col.c}: ${id} (${n})`)
  }
}

console.log(`\nTamam: ${map.size} link eşlendi, ${updated} kolon güncellemesi, ${muxResult.size} video.`)
if (leftovers.length) console.warn("Hâlâ Mux id'si geçen yerler (elle kontrol):\n  " + leftovers.join("\n  "))
await prisma.$disconnect()
