# Çalışma Durumu & Devam Notları (Handoff)

**Son güncelleme:** 2026-06-22
**Amaç:** Farklı bir makinede / yeni bir oturumda kaldığımız yerden kesintisiz devam edebilmek.
Bu dosya + `KOD-DENETIM-RAPORU.md` + `DUZELTME-YOL-HARITASI.md` okunduğunda tüm bağlam gelir.

> **Yeni oturumda Claude'a tek cümle:**
> *"`DEVAM-NOTLARI.md`, `DUZELTME-YOL-HARITASI.md` ve `KOD-DENETIM-RAPORU.md`'yi oku. Faz 1 deploy edildi, Faz 2 / Grup A'dan devam edelim."*

---

## 1. Nerede kaldık

- **Faz 1 (9 güvenlik düzeltmesi) production'a deploy edildi** — `main` @ `315d30b`, Vercel build yeşil, deployment tamamlandı.
- DB migration `20260622120000_phase1_2fa_pending_and_appointment_active_unique` **canlı production DB'sinde uygulandı ve doğrulandı**:
  - `users.twoFactorPendingSecret` kolonu ✓
  - `appointments_active_date_unique` kısmi unique index (`status IN ('pending','approved')`) ✓
  - `_prisma_migrations` kaydı mevcut ✓

### Faz 1'de düzeltilenler (tam detay: `KOD-DENETIM-RAPORU.md`)
- **K-1** — email ayar route'ları doğru RBAC izni (`settings:read/update`); eskiden `requireAdmin()` aslında `ai:create` çağırıyordu → Editor SMTP/Resend secret okuyabiliyordu.
- **K-2** — seed admin şifresi `SEED_ADMIN_PASSWORD` env'inden; prod'da yoksa hard-fail. Mevcut admin `update:{}` ile korunur (her deploy'da sıfırlanmaz).
- **Y-1 + Y-2** — 2FA setup/enable/disable: Zod + rate-limit + `twoFactorPendingSecret` (aktif faktör doğrulanmadan secret ezilmez).
- **Y-4** — permission whitelist (`RESOURCE_LIST`/`ACTION_LIST`), `"*"` privesc engellendi.
- **Y-5** — SMTP test SSRF denylist (loopback/private/link-local + 169.254.169.254) + Zod.
- **Y-7** — randevu çift-rezervasyon → kısmi unique index + `P2002 → 409`.
- **Y-8** — Mux webhook prod'da `MUX_WEBHOOK_SECRET` zorunlu (yoksa 500).
- **Y-18** — PageBuilder save/publish `res.ok` kontrolü + hata toast'ı.

---

## 2. Bekleyen OPERASYONEL işler (kod değil — kullanıcı yapacak)

- [ ] 🔴 **Sızan 2 secret'ı ROTATE et** — Prisma DB connection string + Mux Secret Key (ikisi de sohbette açığa çıktı, yakılmış sayılır). Hem Vercel env hem yeni makinedeki `.env` yeni değerlerle güncellenecek.
- [ ] 🎬 **Mux yeni hesap** — Vercel → Environment Variables (Production):
  - `MUX_TOKEN_ID` = `b0f63ace-2403-43a7-9df4-6623170ab125`
  - `MUX_TOKEN_SECRET` = (Mux'ta yeniden üretilen YENİ secret)
  - `MUX_WEBHOOK_SECRET` = (yeni hesabın webhook secret'ı)
  - → ekledikten sonra production deployment'ı **Redeploy** et (env mevcut build'e işlemez).
- [ ] ✅ **Production smoke test** — giriş, 2FA setup→enable, randevu + aynı slota ikinci (409), e-posta ayarları izinleri, mobil görünüm.

---

## 3. Sıradaki: FAZ 2 (16 bulgu)

Tam detay & risk/bağımlılık: `DUZELTME-YOL-HARITASI.md` → **"FAZ 2"** bölümü. 4 grup:

- **Grup A — hızlı, düşük risk, bağımlılıksız (BURADAN BAŞLA):**
  Y-15 (next-auth pin), Y-16 (kontrast/AA), Y-20 (aria-describedby), Y-6 (audit log), Y-19 (PropertyEditor JSON), Y-21 (manifesto modal focus-trap), Y-22 ("beni hatırla"), Y-23 (Three.js reduced-motion).
- **Grup B — rate-limit altyapısı:** Y-9 (public/login), Y-10 (AI/içerik) + Y-1'i gerçek korumaya bağlar.
  ⚠️ **ÖN-KOŞUL:** Upstash Redis / Vercel KV instance + env. Mevcut `lib/rate-limit.ts` in-memory ve serverless'te etkisiz. (Grup A ile **paralel** kurulabilir.)
- **Grup C — migration + build pipeline (EN RİSKLİ 🔴):**
  Y-12 (indeksler), Y-13 (ApiKey/AuditLog FK + onDelete — **dangling FK veri temizliği ön-koşulu**), Y-14 (build script `migrate resolve ... || true` hack'i). → **ayrı, dikkatli bir oturum + staging provası.**
- **Grup D — erişilebilirlik/işlev:** Y-11 (upload magic-byte / `file-type`), Y-17 (video iframe host allowlist + sandbox).

**Önerilen sıra:** A → (paralelde Upstash kur) → B → **C ayrı migration penceresinde** → D.

---

## 4. Çalışma disiplini (her grupta)

- Mantıklı gruplar halinde ilerle, **her grup sonrası DUR** (kullanıcı kontrol etsin) — Faz 1'deki gibi.
- Her değişiklik sonrası `npm run type-check` (tsc --noEmit) + etkilenen sayfanın manuel testi.
- Küçük, atomik commit'ler (kolay geri alma).
- **Auth / secret / şema** değişiklikleri → **staging zorunlu**, production'da aşamalı.
- Migration kalemleri (Grup C / Y-14) en yüksek dikkatle; veri ön-koşullarını (duplicate / dangling FK) önce kontrol et.

---

## 5. Altyapı gerçekleri (kritik bağlam)

- **Tek paylaşılan Prisma Postgres DB** (`db.prisma.io`). Preview ve production **AYNI DB'yi** migrate eder → preview'da migrate deploy zaten production DB'sini değiştirir.
- `package.json` build script ≈ `migrate resolve --rolled-back <eski> || true && migrate deploy && db seed && next build` → **her deploy'da seed çalışır** (admin `update:{}` ile korunur, şifre sıfırlanmaz).
- **Vercel deploy = git push.** `main` → **production**; feature branch → **Preview**.
- Secret'lar Vercel env'de (Production/Preview/Development scope) ve yerelde `.env` / `.env.local`'de (gitignore'da — repoda DEĞİL).
- `scripts/prisma-with-env.mjs` `.env`/`.env.local`'i okur; `DATABASE_URL`/`POSTGRES_URL`/`PRISMA_DATABASE_URL`'i çözer.

---

## 6. Yeni makinede kurulum

```bash
git clone https://github.com/bugrahansurer/flixflex-website.git
cd flixflex-website

# .env / .env.local'i GÜVENLİ getir (sohbet/e-posta DEĞİL):
#   en temizi:  npm i -g vercel && vercel link && vercel env pull .env.local
#   alternatif: parola yöneticisi / USB ile elle kopyala
#   NOT: rotate ettiğin DB + Mux secret'larının YENİ değerlerini kullan

npm install      # postinstall: prisma generate
npm run dev      # geliştirme
```

Gerekli env'ler (en az): `DATABASE_URL`/`PRISMA_DATABASE_URL`, `NEXTAUTH_SECRET`, SMTP (`SMTP_*`),
AI key'leri (anthropic/openai/gemini), `MUX_TOKEN_ID`/`MUX_TOKEN_SECRET`/`MUX_WEBHOOK_SECRET`, `SEED_ADMIN_PASSWORD`.
