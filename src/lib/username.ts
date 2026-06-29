// ═══════════════════════════════════════════════════════════
// FlixFlex — Kullanıcı adı (username) yardımcıları
// Saf fonksiyonlar — hem sunucu (API) hem istemci (form) kullanır.
// ═══════════════════════════════════════════════════════════

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", I: "I", İ: "I",
  ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U",
}

/** Türkçe karakterleri ASCII karşılıklarına çevirir. */
export function transliterateTr(input: string): string {
  return input.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
}

/** Format kuralı (manuel düzenleme için): 3-30 karakter, küçük harf/rakam/._- */
export const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/

/**
 * İsimden (yoksa e-postadan) ham kullanıcı adı üretir.
 * ≥2 kelime → ilk + son kelime; 1 kelime → o kelime; isim yok → e-posta öneki.
 * Türkçe sadeleştirme + lowercase + yalnızca a-z0-9. Min 3 karaktere tamamlanır.
 */
export function generateUsername(name: string | null | undefined, email: string): string {
  const trimmed = (name ?? "").trim()
  let source: string
  if (trimmed) {
    const parts = trimmed.split(/\s+/)
    source = parts.length >= 2 ? `${parts[0]}${parts[parts.length - 1]}` : parts[0]
  } else {
    source = email.split("@")[0] ?? ""
  }
  const slug = transliterateTr(source).toLowerCase().replace(/[^a-z0-9]/g, "")
  const safe = slug || "user"
  return safe.length >= 3 ? safe : (safe + "000").slice(0, 3)
}

/**
 * base, base2, base3 ... arasından `exists` false dönen ilk adayı verir.
 * `exists` DB kontrolü yapan async callback'tir.
 */
export async function ensureUniqueUsername(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(base))) return base
  for (let i = 2; i < 100000; i++) {
    const candidate = `${base}${i}`
    if (!(await exists(candidate))) return candidate
  }
  throw new Error("Benzersiz kullanıcı adı üretilemedi")
}
