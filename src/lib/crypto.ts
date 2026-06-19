// ═══════════════════════════════════════════════════════════
// FlixFlex — Secret Encryption (at-rest)
//
// AES-256-GCM symmetric encryption for sensitive values stored in
// the database (SMTP passwords, API keys saved via SiteSetting).
//
// The encryption key is derived from NEXTAUTH_SECRET via scrypt, so
// no extra env var is required. Encrypted values carry an `enc:v1:`
// prefix; `decryptSecret` passes through any value WITHOUT the prefix
// unchanged, giving transparent backward-compat for rows that were
// written as plaintext before encryption was introduced.
//
// Node runtime only (uses node:crypto). Never import from edge code.
// ═══════════════════════════════════════════════════════════

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"
import { env } from "@/lib/env"

const PREFIX = "enc:v1:"

// Derive a stable 32-byte key from NEXTAUTH_SECRET. In production the
// env validator guarantees NEXTAUTH_SECRET (≥32 chars); the dev
// fallback keeps local builds working but is NOT secure — never run
// production without NEXTAUTH_SECRET set.
const KEY = scryptSync(
  env.NEXTAUTH_SECRET || "flixflex-dev-insecure-key-set-NEXTAUTH_SECRET",
  "flixflex-settings-salt",
  32
)

/**
 * Encrypt a plaintext secret for at-rest storage.
 * Empty/undefined input returns "" (nothing to encrypt).
 * Already-encrypted input (has prefix) is returned unchanged.
 */
export function encryptSecret(plain: string | undefined | null): string {
  if (!plain) return ""
  if (plain.startsWith(PREFIX)) return plain

  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", KEY, iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return PREFIX + [
    iv.toString("base64"),
    tag.toString("base64"),
    ct.toString("base64"),
  ].join(":")
}

/**
 * Decrypt a value produced by `encryptSecret`.
 * Values without the `enc:v1:` prefix are treated as legacy plaintext
 * and returned as-is (transparent migration).
 * On any failure returns "" and logs server-side.
 */
export function decryptSecret(stored: string | undefined | null): string {
  if (!stored) return ""
  if (!stored.startsWith(PREFIX)) return stored

  try {
    const [, , ivB64, tagB64, ctB64] = stored.split(":")
    const iv = Buffer.from(ivB64, "base64")
    const tag = Buffer.from(tagB64, "base64")
    const ct = Buffer.from(ctB64, "base64")

    const decipher = createDecipheriv("aes-256-gcm", KEY, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8")
  } catch (err) {
    console.error("[crypto] decryptSecret failed:", err)
    return ""
  }
}

/** True if a stored value is encrypted (has the prefix). */
export function isEncrypted(value: string | undefined | null): boolean {
  return Boolean(value && value.startsWith(PREFIX))
}
