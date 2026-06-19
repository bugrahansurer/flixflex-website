// ═══════════════════════════════════════════════════════════
// FlixFlex — TOTP (RFC 6238) — dependency-free
//
// Implements time-based one-time passwords using Node's crypto
// HMAC-SHA1, plus base32 codec, otpauth URI builder, and one-time
// backup-code helpers. Used by the 2FA flow.
// ═══════════════════════════════════════════════════════════

import crypto from "crypto"

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

// ── Base32 (RFC 4648, no padding) ─────────────────────────
export function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ""
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "")
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

// ── Secret generation ─────────────────────────────────────
export function generateSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes))
}

// ── HOTP / TOTP core ──────────────────────────────────────
function hotp(secret: string, counter: number, digits = 6): string {
  const key = base32Decode(secret)
  const buf = Buffer.alloc(8)
  // Write the 64-bit counter big-endian.
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  buf.writeUInt32BE(counter >>> 0, 4)

  const hmac = crypto.createHmac("sha1", key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return (code % 10 ** digits).toString().padStart(digits, "0")
}

export function totp(secret: string, time = Date.now(), step = 30, digits = 6): string {
  const counter = Math.floor(time / 1000 / step)
  return hotp(secret, counter, digits)
}

/**
 * Verify a token within a ±window of time steps (default ±1 = 90s tolerance).
 * Uses constant-time comparison to avoid timing leaks.
 */
export function verifyTotp(secret: string, token: string, window = 1, time = Date.now(), step = 30): boolean {
  const clean = String(token).replace(/\s/g, "")
  if (!/^\d{6}$/.test(clean)) return false
  const counter = Math.floor(time / 1000 / step)
  for (let i = -window; i <= window; i++) {
    const candidate = hotp(secret, counter + i, 6)
    if (crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(clean))) return true
  }
  return false
}

/**
 * Like verifyTotp but returns the matched time-step counter (for replay
 * prevention), or null if no candidate in the window matched.
 */
export function verifyTotpStep(secret: string, token: string, window = 1, time = Date.now(), step = 30): number | null {
  const clean = String(token).replace(/\s/g, "")
  if (!/^\d{6}$/.test(clean)) return null
  const counter = Math.floor(time / 1000 / step)
  for (let i = -window; i <= window; i++) {
    const candidate = hotp(secret, counter + i, 6)
    if (crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(clean))) return counter + i
  }
  return null
}

// ── otpauth:// URI for QR codes ───────────────────────────
export function otpauthUri(secret: string, account: string, issuer = "FlixFlex"): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

// ── Backup codes ──────────────────────────────────────────
export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase() // 10 hex chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`
  })
}

export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code.replace(/[\s-]/g, "").toUpperCase()).digest("hex")
}
