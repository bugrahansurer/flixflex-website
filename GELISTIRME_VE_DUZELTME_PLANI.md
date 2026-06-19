# FlixFlex.com — Geliştirme & Düzeltme Planı

> Kapsamlı kod analizi sonucu hazırlanmış, fazlara bölünmüş çalışma planı.
> Her faz tamamlandıkça işaretlenir. Önce düzeltmeler → sonra yeni geliştirmeler.

---

## 🔴 FAZ 0 — Kritik Güvenlik (P0) — ✅ TAMAMLANDI

> Üretimi doğrudan riske atan açıklar. Hemen kapatıldı.

- [x] **0.1** Hardcoded admin credentials kaldırıldı — `src/lib/auth/index.ts`
  - Koşulsuz "FORCE SUCCESS" bloğu silindi
  - Email içeren debug `console.log`'lar temizlendi
- [x] **0.2** `secret.txt` git takibinden çıkarıldı + dosya silindi
  - `git rm --cached secret.txt` ✓ + working tree'den silindi ✓
  - ✅ **`NEXTAUTH_SECRET` ROTASYONU YAPILDI** — `.env`'e yeni 64-karakter secret üretilip eklendi
    (login `error=Configuration` hatasının da kök nedeniydi; secret hiç set edilmemişti).
  - ⏳ Opsiyonel hijyen: Git history purge (eski secret.txt değeri artık kullanılmıyor/geçersiz).
- [x] **0.3** Media API auth eklendi
  - `src/app/api/media/route.ts` — GET/DELETE/PATCH ✓
  - `src/app/api/media/folders/route.ts` — GET/POST ✓
  - `src/app/api/media/folders/[id]/route.ts` — DELETE/PATCH ✓
- [x] **0.4** Login / HMR dev hatası — `next.config.ts`
  - `allowedDevOrigins: ["10.3.5.57"]` eklendi (LAN IP üzerinden HMR WebSocket düzeltmesi)
  - NOT: Konsol hatalarının çoğu tarayıcı eklentisi gürültüsü (gerçek kod hatası değil)

---

## 🟠 FAZ 1 — Yüksek Güvenlik (P1) — ✅ TAMAMLANDI

- [x] **1.1** Appointments RBAC permission check
  - Yeni `appointments` RBAC resource'u eklendi (resources.ts, permissions.ts matrix, Admin rolü)
  - `GET /api/appointments` → `appointments:read`
  - `PATCH /api/appointments/[id]` → `appointments:update`
  - `appointments/block` (GET/POST/DELETE) → zayıf `isAdmin()` yerine permission gate
  - ⚠️ **MANUEL ADIM:** `npm run db:seed` çalıştır (Super Admin/Admin rollerine yeni izin verilmesi için) + admin'ler yeniden login olmalı
- [x] **1.2** Secret şifreleme (at-rest, AES-256-GCM) — `src/lib/crypto.ts` (yeni)
  - SMTP şifresi (`mail.smtp.pass`) — email route yaz/oku + mail.ts tüketim
  - AI sağlayıcı anahtarları (anthropic/openai/gemini) — integrations route + 3 provider
  - Resend & Mailchimp anahtarları — integrations route + entegrasyonlar sayfası
  - Geriye dönük uyumlu (legacy plaintext satırlar transparan okunur)
- [x] **1.3** JWT `maxAge` 30 gün → 8 saat — `src/lib/auth/config.ts`
- [x] **1.4** Tüm 41 API route auth/permission audit (subagent ile)
  - Sonuç: 0 CRITICAL, 2 MEDIUM bulundu ve düzeltildi
  - `appointments/block` zayıf auth → permission gate
  - `settings/integrations` yanlış izin (`ai:create`) → `settings:read/update`

---

## 🟡 FAZ 2 — Orta Güvenlik & Veri Bütünlüğü (P2) — ✅ TAMAMLANDI

- [x] **2.1** Rate limiting konsolide edildi — `src/lib/rate-limit.ts` (yeni)
  - 3 kopya in-memory limiter tek modüle alındı + expired entry cleanup (memory leak fix)
  - `getClientIp()` helper (x-forwarded-for + x-real-ip fallback)
  - `api/contact` + `api/appointments` refactor edildi
  - NOT: Hâlâ per-instance. Gerçek global limit için Upstash env-gated drop-in hazır (modül dokümante)
- [x] **2.2** XSS — `src/lib/sanitize.ts` (yeni, isomorphic-dompurify)
  - `text-content-section.tsx` + `3d-animation.tsx` (6 cube face) sanitize edildi
  - `isomorphic-dompurify` kuruldu (SSR + client uyumlu)
- [x] **2.3** CSP `unsafe-eval` sadece dev'de — production'da kaldırıldı (`next.config.ts`)
- [x] **2.4** Kullanıcı enumeration — İNCELENDİ/KABUL: `/api/users` zaten `users:create` ile
  gated (sadece admin), login'de constant-time savunma var. Faydalı UX korundu.
- [x] **2.5** Password field — Prisma `omit: { password: true }` (users route 4 sorgu)
- [x] **2.6** Appointment tarih validasyonu — geçmiş tarih + max 3 ay ileri kontrolü

> Ek tespitler (sonraki fazlar için): `api/contact` DB'ye kaydetmiyor (ContactSubmission
> modeli kullanılmıyor — fonksiyonel eksik); `npm audit` 7 transitive açık (Faz 4'te).

---

## 🟢 FAZ 3 — Performans & Frontend Kalite — ✅ TAMAMLANDI

> Not: İlk geniş taramanın Faz 3 bulgularının ÇOĞU false positive çıktı.
> Hedefli doğrulama sonucu kod zaten büyük ölçüde doğruydu. Tek gerçek fix: 3.1.

- [x] **3.1** `BlogCard` memoize edildi (`React.memo`) — blog aramasında per-keystroke
  9 kartın gereksiz re-render'ı önlendi (asıl sıcak yol). PortfolioSection filtresi
  tıklama-tabanlı/seyrek olduğundan düşük öncelik.
- [x] **3.2** `useCallback` — GEREKMİYOR: statik veri + native input; memoize edilmiş
  tüketici yok → cargo-cult olurdu. İncelendi, atlandı.
- [x] **3.3** `use-mouse-position.ts` — ZATEN DOĞRU: `[elementRef]` (stable ref) deps'te.
  `.current`'ı deps'e koymak anti-pattern olurdu. Uyarı false positive'di.
- [x] **3.4** GSAP cleanup — ZATEN MEVCUT: `story-scroll.tsx` (public+ui), `HorizontalShowcase`
  hepsi `t.kill()` / `ctx.revert()` ile temizliyor. Uyarı false positive'di.
- [x] **3.5** `next/image` `sizes` — ZATEN MEVCUT: `image-text-section` vb. `sizes` içeriyor.
- [x] **3.6** `generateMetadata()` — ZATEN MEVCUT: blog/[slug], portfolio/[slug],
  hizmetler/[slug] üçü de tam metadata (OG, canonical, twitter) içeriyor.
- [x] **3.7** `3d-animation.tsx` mobil — JS scale effect (`scaleFactor`) zaten viewport < 1000px
  için ölçekliyor. Sanitizasyon Faz 2'de eklendi.

---

## 🔵 FAZ 4 — Stabilite & Geliştirici Deneyimi — ✅ TAMAMLANDI

- [x] **4.1** Error boundary'ler — `(public)/error.tsx` + `(admin)/error.tsx` (hiç yoktu)
- [x] **4.2** Zustand `uid()` → `crypto.randomUUID()` (zero-dep, nanoid'e gerek kalmadı)
- [x] **4.3** `change-password-form.tsx` — `alert()` anti-pattern kaldırıldı, inline bilgi
  mesajına dönüştü. Tam self-servis reset akışı (token tablosu + public sayfa) → Faz 5.
- [x] **4.4** Lint script düzeltildi (`next lint` Next 16'da kaldırılmıştı → `eslint .`)
  - type-check: TEMIZ ✓
  - lint: **0 HATA** (96→10→0). Tüm hatalar düzeltildi:
    - `kullanicilar/page.tsx` unescaped quotes → HTML entity
    - `project-showcase.tsx` refs-during-render → container origin state'e taşındı
    - 46 unused-vars 22 dosyada temizlendi (subagent)
    - `_`-prefix + ignoreRestSiblings ignore pattern'leri eklendi
  - Kalan 111 warning (build'i bloklamaz): 76 `no-explicit-any` (boundary, kasıtlı),
    24 `no-img-element` (vaka-bazlı), 8 `set-state-in-effect` (meşru matchMedia). Takip ediliyor.
- [x] **4.5** `src/lib/audit.ts` (yeni) — fire-and-forget AuditLog writer
  - Bağlandı: user create/update/delete + password.change
- [x] **Bonus** `api/contact` artık `ContactSubmission`'a kaydediyor (fonksiyonel eksik giderildi)
- [x] **Bonus** npm audit — 7 transitive advisory (next/postcss/next-auth zinciri).
  Auto-fix `next@9.3.3`'e downgrade istiyor (YIKICI) → UYGULANMADI. Framework sürüm
  güncellemesiyle çözülecek, takip ediliyor.

---

## 🚀 FAZ 5 — Yeni Geliştirmeler (Düzeltmeler sonrası)

> Faz 0-4 tamamlandıktan sonra kullanıcı ile belirlenecek özellikler.
> Subagent'lar (`backend-sorcerer`, `frontend-artist`, vb.) ile geliştirme.

---

## Subagent Ekibi (`.claude/agents/`)

| Agent | Sorumluluk |
|-------|-----------|
| `backend-sorcerer` | API, Prisma, Auth, server logic |
| `frontend-artist` | React, GSAP/Framer, UI |
| `security-sentry` | Güvenlik denetimi & hardening |
| `stability-sentinel` | Bug, performance, hydration |
| `ai-pipeline-engineer` | AI özellikleri, blog pipeline |
| `db-architect` | Schema, migration, query opt. |
| `page-builder-specialist` | Page Builder sistemi |
| `component-strategist` | DRY, design system |
