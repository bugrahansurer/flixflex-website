# Kullanıcı Adı (username) Sistemi + Detay Sayfası Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Her kullanıcıya benzersiz bir `username` vermek, admin kullanıcı detay linklerini `/admin/kullanicilar/<username>` yapısına taşımak ve detay sayfasını username alanı içerecek şekilde kompakt/modern yeniden tasarlamak.

**Architecture:** Prisma `User` modeline `username String @unique` eklenir (nullable→backfill→NOT NULL, iki migration). İsimden username üretimi için saf yardımcılar `src/lib/username.ts`'te toplanır (hem API hem form kullanır). Route param `[id]`→`[username]` olur, eski ID linkleri `redirect()` ile yeni URL'ye yönlenir. Geliştirme local Postgres'te yapılır; production'a deploy kullanıcıya bırakılır.

**Tech Stack:** Next.js 16 App Router, Prisma 6, Zod, react-hook-form, Tailwind v4, mevcut FF tasarım bileşenleri (FFContainer, FFInput, FFBadge). **Not:** Projede test runner (vitest/jest) yok; doğrulama `tsx` assert script'i + `tsc --noEmit` + `eslint` + manuel tarayıcı kontrolü ile yapılır. Prisma komutları `node scripts/prisma-with-env.mjs ...` wrapper'ı ile çalışır.

---

## Dosya Yapısı

- **Yeni:** `src/lib/username.ts` — saf username yardımcıları (transliterasyon, üretim, benzersizlik, format regex).
- **Yeni:** `scripts/backfill-usernames.ts` — mevcut kullanıcıları dolduran idempotent script.
- **Yeni:** `scripts/_check-username.ts` — helper doğrulama assert'i (geçici, sonda silinir).
- **Değişir:** `prisma/schema.prisma` — `User.username` (+ 2 migration).
- **Değişir:** `src/lib/validators/user-schema.ts` — zod create/update'e username.
- **Değişir:** `src/app/api/users/route.ts` — POST username üret/kontrol.
- **Değişir:** `src/app/api/users/[id]/route.ts` — PATCH username kontrol.
- **Taşınır+değişir:** `src/app/(admin)/admin/kullanicilar/[id]/page.tsx` → `[username]/page.tsx` (lookup/redirect + redesign).
- **Değişir:** `src/app/(admin)/admin/kullanicilar/page.tsx` — link + tip.
- **Değişir:** `src/components/admin/rbac/user-form.tsx` — username alanı + initial + öneri.

---

## Task 1: Username yardımcıları (`src/lib/username.ts`)

**Files:**
- Create: `src/lib/username.ts`
- Create (temp): `scripts/_check-username.ts`

- [ ] **Step 1: Yardımcı dosyayı yaz**

Create `src/lib/username.ts`:

```ts
// ═══════════════════════════════════════════════════════════
// FlixFlex — Kullanıcı adı (username) yardımcıları
// Saf fonksiyonlar — hem sunucu (API) hem istemci (form) kullanır.
// ═══════════════════════════════════════════════════════════

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
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
```

- [ ] **Step 2: Doğrulama assert'i yaz**

Create `scripts/_check-username.ts`:

```ts
import assert from "node:assert"
import {
  generateUsername,
  ensureUniqueUsername,
  transliterateTr,
  USERNAME_REGEX,
} from "../src/lib/username"

assert.equal(generateUsername("Ömer Baran Ustagül", "x@y.com"), "omerustagul")
assert.equal(generateUsername("Ali Ay", "a@b.com"), "aliay")
assert.equal(generateUsername("", "john.doe@x.com"), "johndoe")
assert.equal(generateUsername("  Çağrı  ", "c@x.com"), "cagri")
assert.equal(transliterateTr("çğışöüÇĞİŞÖÜ"), "cgisouCGISOU")
assert.ok(USERNAME_REGEX.test("omerustagul"))
assert.ok(!USERNAME_REGEX.test("AB"))

;(async () => {
  const taken = new Set(["omerustagul"])
  const u = await ensureUniqueUsername("omerustagul", async (c) => taken.has(c))
  assert.equal(u, "omerustagul2")
  console.log("OK — username helper")
})()
```

- [ ] **Step 3: Doğrulamayı çalıştır**

Run: `npx tsx scripts/_check-username.ts`
Expected: `OK — username helper` (assert hatası yok)

- [ ] **Step 4: Geçici script'i sil**

```bash
rm scripts/_check-username.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/username.ts
git commit -m "feat(users): username üretim/transliterasyon yardımcıları"
```

---

## Task 2: Local DB'ye geç + `username` kolonu (nullable) migration

**Files:**
- Modify: `.env` (DATABASE_URL geçici local)
- Modify: `prisma/schema.prisma:10-31` (User modeli)

- [ ] **Step 1: DATABASE_URL'i local'e al**

`.env` içinde aktif (prod) satırı yorumla, local satırı aç:

```
# Vercel / Prisma Postgres (aktif) — geçici kapalı, geliştirme local'de
# DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
DATABASE_URL="postgresql://postgres:8080@localhost:5432/flixflex?schema=public"
```

- [ ] **Step 2: Local DB erişimini doğrula**

Run: `node scripts/prisma-with-env.mjs migrate status`
Expected: Local DB'ye bağlanır ("Database schema is up to date!" veya bekleyen migration listesi). Bağlanamazsa local Postgres'i başlat ve `flixflex` DB'sinin var olduğundan emin ol — devam etmeden çöz.

- [ ] **Step 3: Şemaya nullable username ekle**

`prisma/schema.prisma`, `User` modeli — `email` satırının altına ekle:

```prisma
  email     String     @unique
  username  String?    @unique
```

- [ ] **Step 4: Migration üret ve uygula (local)**

Run: `node scripts/prisma-with-env.mjs migrate dev --name add_user_username_nullable`
Expected: Yeni migration `prisma/migrations/<ts>_add_user_username_nullable/` oluşur, local'e uygulanır, Prisma Client yeniden üretilir.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(users): username kolonu (nullable+unique) migration"
```

---

## Task 3: Backfill script + mevcut kullanıcıları doldur

**Files:**
- Create: `scripts/backfill-usernames.ts`

- [ ] **Step 1: Backfill script'ini yaz**

Create `scripts/backfill-usernames.ts`:

```ts
// Mevcut kullanıcılara isimlerinden username üretir. İdempotent — yalnızca
// username'i boş/null olanları doldurur. Çalıştır: npx tsx scripts/backfill-usernames.ts
import { PrismaClient } from "@prisma/client"
import { generateUsername, ensureUniqueUsername } from "../src/lib/username"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: { OR: [{ username: null }, { username: "" }] },
    select: { id: true, name: true, email: true },
  })
  console.log(`${users.length} kullanıcıya username üretilecek`)

  for (const u of users) {
    const base = generateUsername(u.name, u.email)
    const username = await ensureUniqueUsername(base, async (candidate) => {
      const found = await prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      })
      return !!found
    })
    await prisma.user.update({ where: { id: u.id }, data: { username } })
    console.log(`  ${u.name ?? u.email} → ${username}`)
  }
  console.log("Tamamlandı.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Backfill'i çalıştır (local)**

Run: `npx tsx scripts/backfill-usernames.ts`
Expected: Her kullanıcı için `İsim → username` satırı; "Ömer Baran Ustagül → omerustagul" görünür. "Tamamlandı." ile biter.

- [ ] **Step 3: Doğrula**

Run: `node scripts/prisma-with-env.mjs studio` değil — bunun yerine hızlı kontrol:
`npx tsx -e "import('@prisma/client').then(async ({PrismaClient})=>{const p=new PrismaClient();console.log(await p.user.findMany({select:{name:true,username:true}}));await p.$disconnect()})"`
Expected: Tüm kullanıcılarda `username` dolu ve benzersiz.

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-usernames.ts
git commit -m "feat(users): mevcut kullanıcılar için username backfill script"
```

---

## Task 4: `username`'i NOT NULL yap (migration B)

**Files:**
- Modify: `prisma/schema.prisma` (User.username)

- [ ] **Step 1: Şemada `?`'i kaldır**

`prisma/schema.prisma`:

```prisma
  username  String     @unique
```

- [ ] **Step 2: Migration üret ve uygula (local)**

Run: `node scripts/prisma-with-env.mjs migrate dev --name user_username_notnull`
Expected: NOT NULL migration uygulanır (backfill sonrası null olmadığı için hatasız geçer), Client yeniden üretilir.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(users): username NOT NULL migration"
```

---

## Task 5: Zod şemalarına username ekle

**Files:**
- Modify: `src/lib/validators/user-schema.ts:7-41`

- [ ] **Step 1: USERNAME_REGEX'i import et ve alanları ekle**

`src/lib/validators/user-schema.ts` üstüne import ekle:

```ts
import { z } from "zod"
import { USERNAME_REGEX } from "@/lib/username"
```

`createUserSchema` içine (`email` alanından sonra) ekle:

```ts
  username: z
    .string()
    .regex(USERNAME_REGEX, "Kullanıcı adı 3-30 karakter; küçük harf, rakam, . _ - olabilir")
    .optional(),
```

`updateUserSchema` içine (`email` alanından sonra) ekle:

```ts
  username: z
    .string()
    .regex(USERNAME_REGEX, "Kullanıcı adı 3-30 karakter; küçük harf, rakam, . _ - olabilir")
    .optional(),
```

- [ ] **Step 2: Tip kontrolü**

Run: `npx tsc --noEmit`
Expected: EXIT 0 (yeni import/alanlar hatasız)

- [ ] **Step 3: Commit**

```bash
git add src/lib/validators/user-schema.ts
git commit -m "feat(users): zod şemalarına username alanı"
```

---

## Task 6: API — POST (üret/kontrol) + PATCH (kontrol)

**Files:**
- Modify: `src/app/api/users/route.ts:97-114`
- Modify: `src/app/api/users/[id]/route.ts:121-138`

- [ ] **Step 1: POST'ta username üret + benzersizlik**

`src/app/api/users/route.ts` üstüne import ekle:

```ts
import { generateUsername, ensureUniqueUsername } from "@/lib/username"
```

`const { name, email, roleId, password } = result.data` satırını şununla değiştir:

```ts
    const { name, email, roleId, password, username: rawUsername } = result.data
```

E-posta `existing` kontrolünden sonra (role kontrolünden önce) ekle:

```ts
    // Username: verilmişse benzersizliğini doğrula, verilmemişse isimden üret.
    let username: string
    if (rawUsername) {
      const taken = await prisma.user.findUnique({ where: { username: rawUsername }, select: { id: true } })
      if (taken) {
        return NextResponse.json({ ok: false, errors: { username: ["Bu kullanıcı adı zaten kullanılıyor."] } }, { status: 400 })
      }
      username = rawUsername
    } else {
      username = await ensureUniqueUsername(generateUsername(name, email), async (c) => {
        const found = await prisma.user.findUnique({ where: { username: c }, select: { id: true } })
        return !!found
      })
    }
```

`prisma.user.create` çağrısındaki `data`'ya `username` ekle:

```ts
      data: { name, email, username, password: hashed, roleId, isActive: true },
```

- [ ] **Step 2: PATCH'te username benzersizlik**

`src/app/api/users/[id]/route.ts` — email benzersizlik bloğundan (`if (result.data.email && ...)`) sonra ekle:

```ts
    if (result.data.username && result.data.username !== user.username) {
      const existing = await prisma.user.findUnique({ where: { username: result.data.username }, select: { id: true } })
      if (existing) {
        return NextResponse.json({ ok: false, errors: { username: ["Bu kullanıcı adı zaten kullanılıyor."] } }, { status: 400 })
      }
    }
```

Not: `user` nesnesinin `username`'i için `findUnique`'e select gerekmez — varsayılan tüm alanları döndürür (zaten `include: { role }` kullanılıyor).

`prisma.user.update` çağrısındaki `data` spread'ine ekle (email satırının yanına):

```ts
        ...(result.data.username !== undefined ? { username: result.data.username } : {}),
```

- [ ] **Step 3: Tip kontrolü**

Run: `npx tsc --noEmit`
Expected: EXIT 0

- [ ] **Step 4: Commit**

```bash
git add src/app/api/users/route.ts "src/app/api/users/[id]/route.ts"
git commit -m "feat(users): API'de username üretimi ve benzersizlik kontrolü"
```

---

## Task 7: Route taşı (`[id]`→`[username]`) + lookup/redirect + redesign

**Files:**
- Move: `src/app/(admin)/admin/kullanicilar/[id]/page.tsx` → `src/app/(admin)/admin/kullanicilar/[username]/page.tsx`

- [ ] **Step 1: Klasörü taşı**

```bash
git mv "src/app/(admin)/admin/kullanicilar/[id]" "src/app/(admin)/admin/kullanicilar/[username]"
```

- [ ] **Step 2: Sayfayı yeniden yaz (lookup/redirect + kompakt redesign)**

`src/app/(admin)/admin/kullanicilar/[username]/page.tsx` içeriğini tamamen şununla değiştir:

```tsx
// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/kullanicilar/[username] — User detail/edit
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Activity, Clock } from "@/lib/icons"
import prisma from "@/lib/prisma"
import { getMockSession } from "@/lib/auth/mock-session"
import { FFContainer } from "@/components/ui/ff-container"
import { FFBadge } from "@/components/ui/ff-badge"
import { UserForm } from "@/components/admin/rbac/user-form"
import { ChangePasswordForm } from "@/components/admin/rbac/change-password-form"
import { DeleteUserButton } from "@/components/admin/rbac/delete-user-button"
import { formatDate, formatRelativeTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ username: string }> }

/** Username ile bulur; bulunamazsa eski ID kabul edip username URL'sine yönlendirir. */
async function resolveUser(usernameOrId: string) {
  if (!prisma) return null
  const byUsername = await prisma.user.findUnique({
    where: { username: usernameOrId },
    include: { role: { select: { id: true, name: true } } },
  })
  if (byUsername) return { user: byUsername, redirectTo: null as string | null }

  const byId = await prisma.user.findUnique({
    where: { id: usernameOrId },
    include: { role: { select: { id: true, name: true } } },
  })
  if (byId) return { user: byId, redirectTo: `/admin/kullanicilar/${byId.username}` }

  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const resolved = await resolveUser(username)
  if (!resolved) return { title: "Kullanıcı Düzenle — FlixFlex Admin" }
  const u = resolved.user
  return { title: `${u.name ?? u.email} — FlixFlex Admin` }
}

function getInitials(name: string | null, email: string): string {
  const src = name?.trim() || email
  const parts = src.split(/\s+/)
  if (parts.length === 1) return (parts[0][0] + (parts[0][1] ?? "")).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default async function UserDetailPage({ params }: Props) {
  const { username } = await params
  const session = await getMockSession()

  if (!prisma) {
    return (
      <div className="px-6 md:px-10 py-8">
        <p className="text-sm text-[#888888]">Veritabanı bağlantısı kurulamadı.</p>
      </div>
    )
  }

  const resolved = await resolveUser(username)
  if (!resolved) notFound()
  if (resolved.redirectTo) redirect(resolved.redirectTo)

  const user = resolved.user
  const [roles, auditLogs] = await Promise.all([
    prisma.role.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.auditLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }).catch(() => []),
  ])

  const isSelf = session?.user.id === user.id
  const initials = getInitials(user.name, user.email)

  return (
    <div className="px-6 md:px-10 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/admin/kullanicilar"
        className="ff-shape-button inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#333333] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kullanıcılara Dön
      </Link>

      {/* Compact header card */}
      <FFContainer className="ff-card" border="subtle" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="ff-shape-button w-12 h-12 flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: "#FF4FD8" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-[#333333] truncate">
                  {user.name ?? user.email}
                </h1>
                {isSelf && <FFBadge variant="purple">Siz</FFBadge>}
                <FFBadge variant="outline">{user.role.name}</FFBadge>
                <FFBadge variant={user.isActive ? "success" : "error"}>
                  {user.isActive ? "Aktif" : "Pasif"}
                </FFBadge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#888888]">
                <span className="font-mono text-[#FF4FD8]">@{user.username}</span>
                <span aria-hidden>·</span>
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <DeleteUserButton userId={user.id} userName={user.name ?? user.email} isSelf={isSelf} />
        </div>
      </FFContainer>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — edit form + password */}
        <div className="xl:col-span-2 space-y-6">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-[#888888]">Bilgileri Düzenle</h2>
            <FFContainer className="ff-card" border="subtle" padding="lg">
              <UserForm
                roles={roles}
                initial={{
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  roleId: user.roleId,
                  isActive: user.isActive,
                }}
              />
            </FFContainer>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-[#888888]">Şifre Değiştir</h2>
            <FFContainer className="ff-card" border="subtle" padding="lg">
              <ChangePasswordForm userId={user.id} />
            </FFContainer>
          </section>
        </div>

        {/* Right — meta + audit */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-[#888888]">Hesap Bilgileri</h2>
            <FFContainer className="ff-card" border="subtle" padding="md">
              <dl className="space-y-3">
                <div>
                  <dt className="text-[10px] font-semibold text-[#888888]">Son Giriş</dt>
                  <dd className="mt-1 text-sm text-[#888888]">
                    {user.lastLogin ? (
                      <span title={formatDate(user.lastLogin)}>{formatRelativeTime(user.lastLogin)}</span>
                    ) : "Hiç giriş yapmadı"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold text-[#888888]">Kayıt Tarihi</dt>
                  <dd className="mt-1 text-sm text-[#888888]">{formatDate(user.createdAt)}</dd>
                </div>
              </dl>
            </FFContainer>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-[#888888] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Son Aktiviteler
            </h2>
            <FFContainer className="ff-card" border="subtle" padding="none">
              {auditLogs.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Clock className="w-6 h-6 text-[#888888] mx-auto mb-2" />
                  <p className="text-xs text-[#888888]">Aktivite kaydı bulunamadı</p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {auditLogs.map((log: { id: string; action: string; createdAt: Date }) => (
                    <li key={log.id} className="px-5 py-3 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4FD8] mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#888888] truncate">{log.action}</p>
                        <p className="text-[10px] text-[#888888] mt-0.5">{formatRelativeTime(log.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </FFContainer>
          </section>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Tip kontrolü**

Run: `npx tsc --noEmit`
Expected: EXIT 0 (UserForm `initial.username` Task 8'de eklenecek — bu adımda hata verirse Task 8 ile birlikte değerlendir; sıralı ilerlerken Task 8'i hemen yap).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/kullanicilar/[username]/page.tsx"
git commit -m "feat(users): detay route'u username'e taşı + kompakt redesign + ID redirect"
```

---

## Task 8: UserForm — username alanı + öneri

**Files:**
- Modify: `src/components/admin/rbac/user-form.tsx`

- [ ] **Step 1: import + initial tipi + defaultValues**

`src/components/admin/rbac/user-form.tsx`:

import satırlarına ekle:

```ts
import { AtSign } from "@/lib/icons"
import { generateUsername } from "@/lib/username"
```

`UserFormProps.initial` tipine `username` ekle:

```ts
  initial?: {
    id: string
    name: string | null
    username: string
    email: string
    roleId: string
    isActive: boolean
  }
```

`defaultValues` içinde her iki dalda username ekle:

```ts
    defaultValues: isNew
      ? { name: "", username: "", email: "", roleId: roles[0]?.id ?? "", password: "", sendInviteEmail: false }
      : { name: initial?.name ?? "", username: initial?.username ?? "", email: initial?.email ?? "", roleId: initial?.roleId ?? "", isActive: initial?.isActive ?? true },
```

- [ ] **Step 2: Yeni kullanıcıda otomatik öneri (manuel override edilene kadar)**

`const sendInvite = ...` satırının altına ekle (içe aktarılan `setValue`'yu `useForm` destructuring'ine de ekle):

`useForm` destructuring'ine `setValue` ekle:

```ts
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<FormData>({
```

Öneri mantığı (component gövdesinde, return'den önce):

```ts
  const usernameTouched = React.useRef(false)
  const nameValue = watch("name" as keyof FormData) as string
  const emailValue = watch("email" as keyof FormData) as string
  const usernameValue = (watch("username" as keyof FormData) as string) ?? ""

  React.useEffect(() => {
    if (!isNew || usernameTouched.current) return
    const suggestion = generateUsername(nameValue || "", emailValue || "")
    setValue("username" as keyof FormData, suggestion as never, { shouldValidate: false })
  }, [isNew, nameValue, emailValue, setValue])
```

- [ ] **Step 3: Username alanını forma ekle**

E-posta `FFInput`'undan hemen sonra ekle:

```tsx
      <div className="flex flex-col gap-1">
        <FFInput
          label="Kullanıcı Adı"
          placeholder="omerustagul"
          leftIcon={<AtSign className="w-4 h-4" />}
          className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-sm text-[#333333] placeholder:text-[#999999]"
          error={(errors as { username?: { message?: string } }).username?.message}
          disabled={isSubmitting}
          {...register("username" as keyof FormData, {
            onChange: () => { usernameTouched.current = true },
          })}
        />
        {usernameValue && (
          <p className="text-[10px] text-[#888888]">
            URL: <span className="font-mono text-[#FF4FD8]">/admin/kullanicilar/{usernameValue}</span>
          </p>
        )}
      </div>
```

- [ ] **Step 4: `React` import kontrolü**

`user-form.tsx` zaten `import * as React from "react"` içeriyor — `useRef`/`useEffect` için `React.` ön ekiyle kullanıldı. Ek import gerekmez.

- [ ] **Step 5: `AtSign` ikonu mevcut mu doğrula**

Run: `grep -n "AtSign" src/lib/icons.ts* src/lib/icons/index.ts 2>/dev/null`
Expected: Varsa kullan. **Yoksa**: `@/lib/icons` barrel'ına `AtSign`'i lucide-react'ten ekle (mevcut export deseniyle aynı şekilde), ya da yerine zaten export edilen `Mail` ikonunu kullan.

- [ ] **Step 6: Tip kontrolü + lint**

Run: `npx tsc --noEmit`
Expected: EXIT 0
Run: `npx eslint src/components/admin/rbac/user-form.tsx`
Expected: Hata yok

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/rbac/user-form.tsx
git commit -m "feat(users): forma username alanı + otomatik öneri + URL önizleme"
```

---

## Task 9: Liste sayfası linkini username'e çevir

**Files:**
- Modify: `src/app/(admin)/admin/kullanicilar/page.tsx:29-36,201`

- [ ] **Step 1: users tipine username ekle**

`page.tsx` içindeki inline `users` tipine `username` ekle:

```ts
  let users: Array<{
    id: string
    name: string | null
    username: string
    email: string
    isActive: boolean
    lastLogin: Date | null
    role: { id: string; name: string }
  }> = []
```

- [ ] **Step 2: Link'i username yap**

Satır ~201:

```tsx
                  <Link href={`/admin/kullanicilar/${user.username}`}>
```

- [ ] **Step 3: Tip kontrolü**

Run: `npx tsc --noEmit`
Expected: EXIT 0 (findMany varsayılan olarak username'i döndürür; tip uyumlu)

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/kullanicilar/page.tsx"
git commit -m "feat(users): liste linkleri username kullanıyor"
```

---

## Task 10: Uçtan uca doğrulama + DATABASE_URL'i prod'a geri al

**Files:**
- Modify: `.env`

- [ ] **Step 1: Tam tip + lint**

Run: `npx tsc --noEmit`
Expected: EXIT 0
Run: `npm run lint`
Expected: Hata yok (mevcut uyarılar dışında yeni hata yok)

- [ ] **Step 2: Manuel doğrulama (local dev server)**

`npm run dev` çalışırken:
- `/admin/kullanicilar` → satırdaki "Düzenle" linki `/admin/kullanicilar/omerustagul` gibi açılır.
- Detay sayfası: başlıkta `@omerustagul`, kompakt düzen, "Bilgileri Düzenle"de Kullanıcı Adı alanı + URL önizleme görünür.
- Eski ID linkini elle ziyaret et (`/admin/kullanicilar/<cuid>`) → username URL'sine yönlenir.
- Yeni kullanıcı oluştur: ad yazınca username otomatik önerilir; kaydet → username'li URL'ye gider.
- Var olan bir username'i başka kullanıcıya atamayı dene → "Bu kullanıcı adı zaten kullanılıyor." hatası.

- [ ] **Step 3: "Ömer Baran Ustagül" username'ini teyit et**

Backfill çıktısında zaten `omerustagul` üretildi (Task 3). Farklıysa, detay sayfasından Kullanıcı Adı alanını `omerustagul` yapıp kaydet.

- [ ] **Step 4: DATABASE_URL'i tekrar production'a al**

`.env` — local satırı yorumla, prod satırını aç (Task 2 Step 1'in tersi). Aktif `DATABASE_URL` yeniden `db.prisma.io` olmalı.

- [ ] **Step 5: Production deploy notu (GÜNCELLENDİ — güvenlik ağı)**

Migration B'ye `SET NOT NULL`'dan önce çalışan bir SQL backfill (güvenlik ağı) eklendi.
Bu sayede **prod deploy artık her durumda güvenli**: Vercel build'i otomatik
`migrate deploy` çalıştırsa bile (A + B), mevcut prod kullanıcıları e-posta+id tabanlı
geçici bir username alır ve NOT NULL kısıtı hatasız uygulanır — build kırılmaz.

Yani normal deploy yeterli (ekstra manuel adım şart değil).

Ömer'e tam `omerustagul` vermek için iki yol:
- **Basit:** Deploy sonrası admin panelden Ömer'in detay sayfasını aç → Kullanıcı Adı'nı
  `omerustagul` yap → Kaydet. (Form bunu destekliyor.)
- **Otomatik:** Prod'da migration A uygulandıktan sonra B'den ÖNCE
  `npx tsx scripts/backfill-usernames.ts` çalıştırılırsa isimler (omerustagul) otomatik gelir
  ve güvenlik ağı 0 satır etkiler.

- [ ] **Step 6: Commit**

```bash
git add .env docs/superpowers
git commit -m "chore(users): geliştirme sonrası DATABASE_URL prod'a alındı + plan/spec"
```

Not: `.env` git'te ignore'lu olabilir — ignore'luysa commit'e dahil olmaz, sorun değil.

---

## Self-Review Notları

- **Spec kapsamı:** username üretimi (Task 1,3), şema/migration (Task 2,4), API (Task 6), routing+redirect (Task 7), redesign (Task 7), form alanı (Task 8), linkler (Task 9), prod deploy notu (Task 10) — tüm spec bölümleri karşılanıyor.
- **Tip tutarlılığı:** `generateUsername(name, email)`, `ensureUniqueUsername(base, exists)`, `USERNAME_REGEX` her yerde aynı imzayla kullanıldı. `initial.username: string` (Task 8) ↔ sayfanın geçtiği `user.username` (Task 7) uyumlu.
- **Test runner yok:** saf helper `tsx` assert ile doğrulanır; gerisi `tsc`/`eslint`/manuel.
- **Bağımlılık sırası:** Task 7 (sayfa, `initial.username` geçer) ve Task 8 (formun `initial.username` kabulü) birbirine bağlı — sıralı yapılmalı; ikisi tamamlanmadan `tsc` temiz olmayabilir.
