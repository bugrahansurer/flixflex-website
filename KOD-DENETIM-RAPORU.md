# FlixFlex — Kod Denetim Raporu

**Tarih:** 2026-06-22
**Kapsam:** Tüm kod tabanı (src/app, src/components, src/lib, src/store, src/hooks, src/types, prisma, config)
**Teknoloji yığını:** Next.js 16 (App Router/RSC), React 19, TypeScript 5, Tailwind v4, Prisma 6 + PostgreSQL, NextAuth v5 (beta), Zustand, Zod, Radix UI, Framer Motion, Mux, Vercel Blob + sharp, Nodemailer/Resend, Anthropic/OpenAI/Gemini.
**Yöntem:** Dosya-dosya, salt-okunur denetim (5 paralel uzman ajan). Manşet/kritik bulgular ayrıca elle doğrulandı (aşağıda **✓ Doğrulandı** ile işaretli). **Hiçbir kod değiştirilmedi.** Severity'ler, kullanıcının tanımlarına göre kalibre edildi (özellikle birkaç "Kritik XSS" iddiası, React'in attribute escape'i nedeniyle daha düşük seviyeye çekildi).

---

## ÖZET

| Önem | Adet |
|---|---|
| 🔴 Kritik | 2 |
| 🟠 Yüksek | 22 |
| 🟡 Orta | 24 |
| 🟢 Düşük | 15 |
| **Toplam** | **63** |

> Not: Kesişen (çok dosyada tekrar eden) sorunlar tek madde altında konsolide edildi (ör. bozuk Tailwind sınıfları, `<img>` kullanımı, `key={index}`). Denetim ajanlarının "Kritik" etiketlediği 6 maddeden 2'si elle doğrulanıp gerçekten Kritik bulundu; diğerleri (randevu yarışı, Mux webhook, seed dışı XSS iddiaları) doğru ama severity olarak Yüksek/Orta'ya kalibre edildi.

### 🔥 En Kritik 5 Madde (öncelik sırasıyla)

1. **[K-1] E-posta ayarları yanlış izinle korunuyor → SMTP/Resend secret sızıntısı + yetki yükseltme** — `requireAdmin()` aslında `ai:create` kontrol ediyor; `ai:create` yetkisi olan **Editor** rolü `GET /api/settings/email` ile şifresi çözülmüş SMTP parolasını ve Resend anahtarını okuyabiliyor. **✓ Doğrulandı.**
2. **[K-2] Seed'de sabit admin şifresi + her deploy'da otomatik seed** — `SEED_ADMIN_PASSWORD` set edilmezse bilinen `admin@flixflex.com` / `FlixFlex2026!` kimliğiyle Super Admin oluşur; `build` adımı her deploy'da `db seed` çalıştırıyor. **✓ Doğrulandı.**
3. **[Y-7] Randevu çift-rezervasyon yarış koşulu** — `Appointment.date` üzerinde `@unique` yok; POST `findFirst`→`create` (TOCTOU) ile aynı slota iki onaylı randevu yazılabilir. **✓ Doğrulandı.**
4. **[Y-8] Mux webhook imza doğrulaması fail-open** — imza yalnızca `if (secret)` ile doğrulanıyor; `MUX_WEBHOOK_SECRET` set edilmemiş bir deploy'da herkes sahte `video.asset.ready` ile medya kayıtlarının stream URL'lerini ezebilir. **✓ Doğrulandı.**
5. **[Y-5] `email/test` route'unda SSRF + secret gövdeden** — `smtpHost`/`smtpPort` saldırgan kontrolünde, doğrulama yok; iç ağa bağlantı zorlanabilir. Yanlış izin (Y-3/K-1) ile birleşince Editor rolü tetikleyebilir.

---

## 🔴 KRİTİK BULGULAR

### [K-1] E-posta ayar route'ları yanlış kaynakla korunuyor (secret sızıntısı + yetki yükseltme) — ✓ Doğrulandı
- **Önem:** Kritik
- **Kategori:** Güvenlik
- **Konum:** `src/lib/ai/api-utils.ts:41-46` + `src/app/api/settings/email/route.ts:12,20,24,32`
- **Açıklama:** `requireAdmin()` içeride `requirePermission("ai","create")` çağırıyor. `email/route.ts` GET ve POST bu `requireAdmin()`'i kullanıyor; GET şifresi çözülmüş `smtpPass` ve `resendKey` döndürüyor. RBAC matrisinde **Editor** rolü `ai:create` iznine sahip ama `settings` üzerinde hiçbir izni yok.
- **Etki:** Yalnızca AI içerik üretme yetkisi olan bir kullanıcı SMTP parolasını ve Resend API anahtarını düz metin okuyabilir; e-posta gönderici ayarını değiştirebilir. Klasik yetki yükseltme + at-rest şifrelemeyi anlamsız kılan secret ifşası.
- **Çözüm:** `email/route.ts` ve `email/test/route.ts` içinde `requireAdmin()` yerine doğru kaynağı kullan:
  ```ts
  const gate = await requirePermission("settings", "read")   // GET
  const gate = await requirePermission("settings", "update")  // POST/test
  ```

### [K-2] Seed'de sabit varsayılan admin şifresi + build her deploy'da seed çalıştırıyor — ✓ Doğrulandı
- **Önem:** Kritik
- **Kategori:** Güvenlik
- **Konum:** `prisma/seed.ts:14-18`; `package.json:7` (build → `... db seed && next build`)
- **Açıklama:** `SEED_ADMIN_PASSWORD` boşsa fallback `"FlixFlex2026!"` kullanılıyor; e-posta sabit `admin@flixflex.com`. Build her deploy'da seed çalıştırdığından env unutulursa production bu bilinen kimlikle oluşur. Sabit string git geçmişinde de kalıcıdır.
- **Etki:** Bilinen e-posta + bilinen şifre = herkese açık Super Admin erişimi.
- **Çözüm:** Fallback'i kaldır; `SEED_ADMIN_PASSWORD` yoksa production'da hard-fail et:
  ```ts
  if (!process.env.SEED_ADMIN_PASSWORD) {
    if (process.env.NODE_ENV === "production") throw new Error("SEED_ADMIN_PASSWORD zorunlu")
    // dev: yine de güçlü rastgele üret
  }
  ```
  Mevcut deploy'larda bu şifreyi acilen değiştir.

---

## 🟠 YÜKSEK BULGULAR

### [Y-1] 2FA enable/disable/setup'ta rate limit ve input validasyonu yok
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/app/api/security/2fa/enable/route.ts`, `disable/route.ts`, `setup/route.ts`
- **Açıklama:** Route'lar yalnızca session kontrol ediyor; TOTP doğrulama denemelerine rate limit yok, `token` Zod ile valide edilmiyor (`String(body.token ?? "")`).
- **Etki:** Çalınmış oturumla saldırgan 6 haneli TOTP'yi sınırsız deneyip 2FA'yı kapatabilir; 2FA'nın koruyucu değeri rate limit'e bağlıdır.
- **Çözüm:** Her doğrulama denemesine `rateLimit({ key: userId, max: 5, windowMs: 60_000 })`; body'yi `z.object({ token: z.string().regex(/^\d{6}$|^[A-Z0-9-]{8,}$/) })` ile doğrula.

### [Y-2] 2FA setup mevcut faktörü doğrulamadan secret'ı eziyor
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/app/api/security/2fa/setup/route.ts:20-23`
- **Açıklama:** Kullanıcının zaten etkin 2FA'sı olup olmadığı / mevcut TOTP doğrulaması istenmeden `twoFactorSecret` yeni provisional secret ile eziliyor.
- **Etki:** Çalınmış oturumla saldırgan kendi authenticator'ını bağlayabilir veya meşru kullanıcıyı kilitleyebilir.
- **Çözüm:** Etkin 2FA varsa setup öncesi mevcut TOTP/backup doğrula; provisional secret'ı ayrı alanda (`twoFactorPendingSecret`) tut, yalnızca `enable` başarılı olunca taşı.

### [Y-3] Middleware `/api/*`'ı kapsamıyor — savunma derinliği yok
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/middleware.ts:73-74,116-126`
- **Açıklama:** Matcher yalnızca `/admin/:path*` ve `/giris`. Tüm API yetkilendirmesi her handler'da tek tek yapılıyor; tek bir handler'da gate'i unutmak/yanlış yazmak (K-1 tam bu) doğrudan açık demek. `verifyApiKey` hiçbir route'da çağrılmıyor.
- **Etki:** Yeni eklenen bir `/api` route'u gate eklemeyi unutursa anında yetkisiz erişime açık.
- **Çözüm:** Hassas API prefix'lerini matcher'a ekleyip edge'de en azından kimlik doğrula; merkezi bir `requirePermission` konvansiyonunu zorunlu kıl.

### [Y-4] Permission şeması whitelist değil — `*:*` ve tanımsız kaynak yazılabilir
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/lib/validators/permission-schema.ts:8-12`; kullanım `src/app/api/roles/[id]/permissions/route.ts`
- **Açıklama:** `resource`/`action` yalnızca `z.string().min(1)`; `RESOURCE_LIST`/`ACTION_LIST` whitelist'i yok. `hasPermission` `"*"`/`"manage"`'i tam yetki sayıyor → `*:*` yazılması role global süper-yetki verir.
- **Etki:** Yetki yükseltme yüzeyi; tanımsız kaynaklarla "ölü izin" kirliliği.
- **Çözüm:** `resource: z.enum(RESOURCE_LIST)`, `action: z.enum(ACTION_LIST)`.

### [Y-5] `email/test` route'unda SSRF + input validasyonu yok
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/app/api/settings/email/test/route.ts`
- **Açıklama:** `smtpHost/smtpPort/smtpUser/smtpPass/resendKey/testEmail` doğrudan body'den, Zod'suz alınıp `nodemailer.verify()`/`fetch` ile kullanılıyor. `smtpHost` saldırgan kontrolünde → iç ağa (ör. `169.254.169.254`) bağlantı zorlanabilir; hata mesajı yansıyor.
- **Etki:** SSRF + bilgi sızıntısı; yanlış izinle (K-1) Editor tetikleyebilir.
- **Çözüm:** `testEmail`'i email schema ile valide et; private IP/host aralıklarını engelle; hata mesajını jenerikleştir; yetkiyi `settings:update`'e bağla.

### [Y-6] Hassas mutasyonlarda audit log eksik
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/app/api/roles/**`, `src/app/api/profile/**`, `security/2fa/**`, `settings/api-keys/**`
- **Açıklama:** Users route'ları `logAudit` kullanıyor, ancak rol/izin mutasyonları, kendi profil/şifre değişimi, 2FA enable/disable ve API-key oluştur/sil işlemleri iz bırakmıyor.
- **Etki:** Hesap ele geçirme ve yetki değişiklikleri tespit edilemez; ihlal sonrası adli analiz kör.
- **Çözüm:** Bu işlemlere `logAudit({...})` ekle (role.*, profile.*, 2fa.*, api-key.*), metadata ile.

### [Y-7] Randevu çift-rezervasyon yarış koşulu — ✓ Doğrulandı
- **Önem:** Yüksek · **Kategori:** Hata/Mantık
- **Konum:** `prisma/schema.prisma:285-300` (`Appointment`); `src/app/api/appointments/route.ts:127-153`
- **Açıklama:** `Appointment.date` üzerinde `@unique` yok (oysa `BlockedSlot.date`'te var). POST `findFirst` ile kontrol edip `create` çağırıyor (check-then-act). Eşzamanlı iki istek aynı slota yazabilir.
- **Etki:** Aynı saate çift rezervasyon; takvim doğruluğu bozulur.
- **Çözüm:** `date`'e (gerekirse status-filtreli kısmi) unique index ekleyip atomik yazıma güven:
  ```ts
  try { await prisma.appointment.create({...}) }
  catch (e) { if (e.code === "P2002") return json({ ok:false, message:"Bu saat dolu." }, 409); throw e }
  ```

### [Y-8] Mux webhook imza doğrulaması fail-open — ✓ Doğrulandı
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/app/api/media/webhook/route.ts:28-37`; `src/lib/env.ts` (`MUX_WEBHOOK_SECRET` optional)
- **Açıklama:** İmza yalnızca `if (secret)` bloğunda doğrulanıyor; secret yoksa tüm gövde doğrulanmadan işleniyor. Webhook public.
- **Etki:** Secret set edilmemiş bir deploy'da saldırgan sahte payload'la herhangi bir `muxAssetId` için `url`/`muxPlaybackId`/`muxStatus` ezebilir (içerik tahrifi).
- **Çözüm:** Production'da secret zorunlu olmalı; yoksa 500/401 dön:
  ```ts
  if (!secret && process.env.NODE_ENV === "production")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  ```

### [Y-9] Public/login rate-limit zayıf — XFF spoofing + in-memory (serverless'te etkisiz)
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/lib/rate-limit.ts:98-104`; `src/app/api/contact/route.ts`, `appointments/route.ts`; `src/lib/auth/index.ts` (login'de rate-limit yok)
- **Açıklama:** `getClientIp` doğrudan `x-forwarded-for`'a güveniyor → her istekte sahte IP ile limit atlatılabilir; limiter in-memory + per-instance, serverless'te global koruma yok. Login akışında hiç rate-limit yok.
- **Etki:** Contact/appointments spam/flood; login brute-force/credential stuffing.
- **Çözüm:** Platformun güvenilir IP'sini kullan (`request.ip`/`@vercel/functions`); kalıcı limiter (Upstash Redis); login'e IP+email bazlı limit; contact'a honeypot/CAPTCHA.

### [Y-10] AI ve içerik mutasyon route'larında kalıcı rate-limit yok
- **Önem:** Yüksek · **Kategori:** Güvenlik/Performans
- **Konum:** `src/lib/ai/api-utils.ts:94-112` (in-memory); `blog/services/portfolio/pages` POST/PATCH
- **Açıklama:** AI rate-limit in-memory `Map` (serverless'te `5 × instanceCount`); full-pipeline tek istekte 5 ardışık LLM çağrısı. İçerik yazma route'larında hiç limit yok.
- **Etki:** AI maliyet patlaması (financial DoS); içerik kütle yazımı.
- **Çözüm:** Paylaşılan kalıcı limiter'a taşı; full-pipeline'a daha sıkı bütçe.

### [Y-11] `media/upload` MIME doğrulaması yalnızca client `file.type`'a güveniyor
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/app/api/media/upload/route.ts:277-282`
- **Açıklama:** İzinli tür kontrolü istemci-bildirimli Content-Type'a dayalı; magic-byte doğrulaması yok. Raster olmayan dosyalar sharp'tan geçmeden Blob'a `access: "public"` yazılıyor.
- **Etki:** İzinli tür altında keyfi içerik depolama (phishing/malware barındırma; içerik bütünlüğü).
- **Çözüm:** `file-type` ile gerçek MIME tespiti + bildirilen türle çapraz doğrulama; `X-Content-Type-Options: nosniff`, `Content-Disposition: attachment`.

### [Y-12] Sık sorgulanan alanlarda DB indeksi yok
- **Önem:** Yüksek · **Kategori:** Performans
- **Konum:** `prisma/schema.prisma` — `BlogPost.status/publishedAt`, `Page.isPublished`, `PortfolioItem.isPublished/order`, `Service.isPublished/order/parentId`, `Appointment.status/date/isRead`, `ContactSubmission.isRead/createdAt`, `Media.folderId`, `PageVersion.pageId`
- **Açıklama:** Şemada hiç `@@index` yok. Public listeleme `isPublished + order/publishedAt`, admin tabloları `status/isRead/createdAt desc` ile sürekli sorgulanıyor; FK alanları (folderId/parentId/pageId) otomatik indekslenmez.
- **Etki:** Sequential scan; trafikle render süreleri ve DB CPU'su artar (ana sayfa her istekte Page/Portfolio/Blog sorgular).
- **Çözüm:** Örn. `@@index([isPublished, order])`, `@@index([status, publishedAt])`, `@@index([status, date])`, `@@index([folderId])`, `@@index([parentId])`, `@@index([pageId])`.

### [Y-13] `ApiKey`/`AuditLog` ilişki + indeks + `onDelete` eksiklikleri
- **Önem:** Yüksek · **Kategori:** Hata/Mantık + Performans
- **Konum:** `prisma/schema.prisma` — `ApiKey.createdById/prefix/hashedKey`, `AuditLog.userId`
- **Açıklama:** `ApiKey.createdById` ilişkisiz (dangling), `prefix`/`hashedKey` indeksi yok (key doğrulama full-scan). `AuditLog.userId` ilişkisinde `onDelete` yok (default Restrict → audit'i olan kullanıcı silinemez) ve indeks yok.
- **Etki:** Key doğrulama latency'si büyür; kullanıcı silme FK hatasıyla başarısız; audit listeleri yavaş.
- **Çözüm:** `prefix @unique`/`@@index([hashedKey])`; `createdBy User? @relation(..., onDelete: SetNull)` + `@@index([createdById])`; `AuditLog` için `onDelete: Cascade`/`SetNull` + `@@index([userId])`, `@@index([createdAt])`.

### [Y-14] Build script her deploy'da migration'ı zorla `rolled-back` işaretliyor + hata yutuyor
- **Önem:** Yüksek · **Kategori:** Hata/Mantık
- **Konum:** `package.json:7`
- **Açıklama:** `migrate resolve --rolled-back 20260531...hierarchy || true && migrate deploy && db seed && next build`. Her build'de o migration manipüle ediliyor; `|| true` gerçek migration hatalarını yutuyor. İlgili migration SQL'i `IF NOT EXISTS` ile sarılı — bir drift/elle kurtarma kalıntısı.
- **Etki:** `_prisma_migrations` güvenilmez; gerçek migration sorunu sessizce geçilir; her build'de production seed çalışır (K-2 ile birleşir).
- **Çözüm:** Drift'i kalıcı çöz, hack'i kaldır; build'i `migrate deploy && next build`'e indir; seed'i ayrı/koşullu adıma al; `|| true`'yu kaldır.

### [Y-15] `next-auth` beta sürümü production'da (caret aralıkla)
- **Önem:** Yüksek · **Kategori:** Güvenlik (bağımlılık)
- **Konum:** `package.json:59` (`"next-auth": "^5.0.0-beta.31"`)
- **Açıklama:** Auth katmanı stabil olmayan beta'ya bağlı; `^` ile yeni beta'lar otomatik kabul → reproducible olmayan build ve düzeltilmemiş auth davranışı riski.
- **Etki:** Auth regresyonu doğrudan kimlik doğrulama/oturum güvenliğini etkiler.
- **Çözüm:** Sürümü tam pin'le (`"5.0.0-beta.31"`), lock dosyasıyla sabitle; GA çıkınca geç; güvenlik changelog'unu takip et.

### [Y-16] `globals.css` renk kontrastı WCAG AA'yı karşılamıyor
- **Önem:** Yüksek · **Kategori:** Erişilebilirlik
- **Konum:** `src/app/globals.css` (`--foreground-muted: #888888`, `--foreground-faint`, `.ff-badge-charcoal` beyaz yazı)
- **Açıklama:** Açık temada `--foreground-muted: #888888` `#F7F7F5` üzerinde ~2.5:1 (AA için 4.5:1 gerekir). `.ff-badge-charcoal` neon-sarı zemin + beyaz yazı ~1.3:1 (okunaksız). (Değişken adları da yanıltıcı: `--ff-purple` aslında pembe, `--ff-charcoal` neon sarı.)
- **Etki:** Düşük görüşlü kullanıcılar muted metinleri ve charcoal badge'leri okuyamaz; WCAG 2.1 AA başarısız.
- **Çözüm:** Muted'ı en az `#595959`'a koyulaştır; charcoal badge metnini koyu yap (`#0D0D0D`).

### [Y-17] `video-embed-section` iframe `src`'si doğrulanmadan render ediliyor
- **Önem:** Yüksek · **Kategori:** Güvenlik
- **Konum:** `src/components/public/sections/video-embed-section.tsx:86-92`
- **Açıklama:** Admin-girdili `videoUrl`'den türeyen `embedUrl` doğrudan `<iframe src>`'e veriliyor; host allowlist yok, `sandbox` yok, geniş `allow`. Yalnızca YouTube watch→embed dönüşümü var; gerisi ham geçer. `iframe src="javascript:..."` bazı tarayıcılarda script çalıştırabilir.
- **Etki:** Keyfi 3. taraf origin gömme/clickjacking; olası iframe XSS. (Page-builder erişimi gerektirdiğinden Kritik değil, ama iframe `<img>`'den ciddi.)
- **Çözüm:** Host allowlist (youtube/vimeo/mux) + `sandbox="allow-scripts allow-same-origin allow-presentation"`; `javascript:`/`data:` reddet.

### [Y-18] PageBuilder kaydet/yayınla `res.ok` kontrol etmiyor → sessiz başarısızlık
- **Önem:** Yüksek · **Kategori:** Hata/Mantık
- **Konum:** `src/components/admin/page-builder/page-builder.tsx:72-83,145-158`
- **Açıklama:** `fetch` sonrası `res.ok` kontrol edilmiyor; 4xx/5xx `catch`'e düşmez, ardından `markSaved()`/`setStatus("published")` çağrılır. Sunucu 403/500 dönse bile UI "Kaydedildi/Yayında" gösterir.
- **Etki:** Kullanıcı değişikliklerin kaydedildiğini sanır; gerçek veri kaybı.
- **Çözüm:** `if (!res.ok) throw new Error(...)`; `catch`'te kullanıcıya görünür hata state'i göster.

### [Y-19] PropertyEditor JSON (dizi/obje) alanları sessizce yutuluyor + düzenlenemez
- **Önem:** Yüksek · **Kategori:** Hata/Mantık
- **Konum:** `src/components/admin/page-builder/property-editor.tsx:484-501`
- **Açıklama:** `JSON.parse` boş `catch` ile sarılı (geçersizde sessiz); ayrıca controlled `value={JSON.stringify(...)}` her karakterde parse edilemeyip eski değere "geri zıplar" → dizi/obje prop'ları pratikte düzenlenemez.
- **Etki:** Bazı section prop'ları (liste alanları) hiç düzenlenemez; sessiz kullanıcı engeli.
- **Çözüm:** Yerel taslak state + blur'da commit + parse hatasında görünür uyarı.

### [Y-20] FFInput/FFTextarea hata mesajı `aria-describedby` ile bağlanmıyor
- **Önem:** Yüksek · **Kategori:** Erişilebilirlik
- **Konum:** `src/components/ui/ff-input.tsx:45-78,106-123`
- **Açıklama:** `aria-invalid` var ama hata/ipucu `<p>`'lerinde id yok ve input'a `aria-describedby` bağlanmıyor. Bu bileşen iletişim + randevu formlarının tamamında kullanılıyor.
- **Etki:** Form hataları ekran okuyucuya iletilmez; WCAG 3.3.1 başarısız.
- **Çözüm:** Hata/ipucu `<p>`'lerine `id` ver, input'a `aria-describedby` ekle.

### [Y-21] `modern-manifesto` medya klavyeyle açılamıyor + modalde focus trap/Escape yok
- **Önem:** Yüksek · **Kategori:** Erişilebilirlik
- **Konum:** `src/components/public/sections/modern-manifesto.tsx:137-152,204-277`
- **Açıklama:** Medya kapsülü tıklanabilir `motion.span` (role/tabIndex/onKeyDown yok). Açılan modal Escape ile kapanmıyor, focus trap yok, `role="dialog"`/`aria-modal` yok, odak modale taşınmıyor.
- **Etki:** Klavye/ekran okuyucu kullanıcıları medyayı kullanamaz.
- **Çözüm:** Kapsülü `<button>` yap; modali projedeki `@radix-ui/react-dialog` ile değiştir (Escape/focus-trap/ARIA ücretsiz).

### [Y-22] LoginCard "Beni hatırla" işlevsiz
- **Önem:** Yüksek · **Kategori:** Hata/Mantık
- **Konum:** `src/components/admin/auth/login-card.tsx:63,83-89,228-262`
- **Açıklama:** `rememberMe` state tutuluyor/UI'da gösteriliyor ama `signIn("credentials", {...})`'e geçilmiyor.
- **Etki:** Yanıltıcı UI; kullanıcı beklediği oturum davranışını alamaz.
- **Çözüm:** `rememberMe`'yi `signIn`'e ilet ve session `maxAge`'i ayarla; ya da özelliği kaldır.

### [Y-23] `WovenLightHero` (Three.js) `prefers-reduced-motion` yok + her frame ağır allocation
- **Önem:** Yüksek · **Kategori:** Performans/Erişilebilirlik
- **Konum:** `src/components/ui/woven-light-hero.tsx:114-257`
- **Açıklama:** 50.000 partikül için her frame `new THREE.Vector3()` (×3-4) → yüksek GC baskısı; reduced-motion kontrolü yok; sekme gizlendiğinde durdurma yok. (Dinamik import `ssr:false` iyi.)
- **Etki:** Düşük güçlü cihazlarda kare düşüşü/ısınma; hareket hassasiyeti olan kullanıcılar için rahatsızlık.
- **Çözüm:** `matchMedia("(prefers-reduced-motion: reduce)")` ile statik kareye düş; geçici `Vector3`'leri döngü dışında yeniden kullan; `document.hidden`'da `cancelAnimationFrame`.

---

## 🟡 ORTA BULGULAR

### [O-1] `decryptSecret` hatada sessizce boş string döndürüyor
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `src/lib/crypto.ts:58-75`
- **Açıklama/Etki:** Yanlış key/bozuk veri/`NEXTAUTH_SECRET` rotasyonunda tüm secret'lar sessizce `""`; login'de `decryptSecret(twoFactorSecret)` boş dönerse TOTP hep başarısız → kullanıcı kilitlenir; e-posta sessizce gönderilmez.
- **Çözüm:** Hata durumunda ayırt edilebilir sinyal (throw/`null`) dön; boş string'i "geçerli secret" gibi ele alma. Secret rotasyonu için ayrı versiyonlu `ENCRYPTION_KEY` değerlendir.

### [O-2] JWT 8 saat — rol/izin iptali ve `isActive` anında etkili değil
- **Önem:** Orta · **Kategori:** Güvenlik · **Konum:** `src/lib/auth/config.ts:38-41,61-95`
- **Açıklama/Etki:** İzinler JWT'ye gömülü, ilk login'den sonra tazelenmiyor. Rol düşürülse/izin kaldırılsa/`isActive=false` yapılsa bile token 8 saate kadar eski yetkilerle geçerli.
- **Çözüm:** Hassas işlemlerde DB'den `isActive`+güncel izin doğrula veya `jwt` callback'inde periyodik tazeleme.

### [O-3] `users PATCH` — son Super Admin / kendi hesabını pasifleştirme engeli yok
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `src/app/api/users/[id]/route.ts:115-138`
- **Açıklama/Etki:** Kendi rolünü kaldırma engelli ama kendini `isActive:false` yapma ve son aktif Super Admin'i pasifleştirme engellenmiyor → yönetim erişimi tamamen kaybedilebilir.
- **Çözüm:** "En az bir aktif Super Admin kalmalı" invariant'ı; kendi hesabını pasifleştirmeyi engelle.

### [O-4] Hata mesajı sızıntısı — `err.message`/`details` istemciye yansıyor
- **Önem:** Orta · **Kategori:** Güvenlik · **Konum:** `media/upload-url/route.ts:102`, `media/sync-mux/route.ts:42,112`, `mail.ts:259`, `notify.ts:55-60` (→ `appointments/[id]` `emailError`)
- **Açıklama/Etki:** Prisma stack/Mux endpoint/SMTP host-port/sağlayıcı hata kodları admin paneline ve loglara sızar; recon yüzeyi genişler. Diğer route'larda generic mesaj kullanılırken tutarsızlık var.
- **Çözüm:** İstemciye generic mesaj; ayrıntıyı yalnızca server log'una yaz.

### [O-5] `media` PATCH/DELETE — Zod yok, `folderId` doğrulanmıyor (FK→500)
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `src/app/api/media/route.ts:57,88-98`
- **Açıklama/Etki:** Ham `req.json()`; geçersiz/var olmayan `folderId` doğrudan `update`'e gidiyor → FK ihlali generic 500; `title` sınırsız. `upload/route.ts`'te folderId regex'i varken burada yok (tutarsız).
- **Çözüm:** Zod ile doğrula; aynı `folderId` regex'i + `title.max(...)`; P2003/P2025 yakala → 400/404.

### [O-6] `appointments/slots` yıl sınırı yok; `block` POST validasyonsuz
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `appointments/slots/route.ts:23-32`, `block/route.ts:55-69`
- **Açıklama/Etki:** Public `slots`'ta `year` üst/alt sınırı yok (`year=999999` geniş aralık sorgusu); `block` POST'unda `date`/`reason` Zod'suz, sınırsız.
- **Çözüm:** `year`'ı (mevcut ±2) sınırla; `block`'u Zod ile (`reason.max(500)`, tarih sınırları).

### [O-7] AI `model` parametresi allowlist değil + prompt injection yüzeyi
- **Önem:** Orta · **Kategori:** Güvenlik · **Konum:** `src/lib/ai/engine.ts:41-63`; AI route'larında `model: z.string().optional()`
- **Açıklama/Etki:** `model` serbest string; `detectProvider` ada bakarak sağlayıcı seçtiğinden kullanıcı pahalı bir model/sağlayıcı seçebilir (maliyet). `topic/title/article` prompt'a doğrudan gömülüyor (admin-gated olduğundan Orta).
- **Çözüm:** `model: z.enum([...allowedModels])`; kullanıcı girdisini açık sınırlayıcılarla ayır.

### [O-8] `pages` route DB hatası sessizce in-memory store'a düşüyor
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `src/app/api/pages/route.ts`, `pages/[id]/route.ts`
- **Açıklama/Etki:** Her Prisma hatası `catch` ile in-memory `globalThis` store'a yazıyor → slug çakışması "başarılı" gibi 201 dönebilir; veri kalıcı olmaz (instance başına ayrı Map); sessiz veri kaybı.
- **Çözüm:** "DB yapılandırılmamış" (`prisma===null`) ile çalışma-zamanı hatasını ayır; gerçek hatada 500/409 dön.

### [O-9] `services`/`portfolio` POST/PATCH — Prisma hata yönetimi yok
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `services/route.ts:31-38`, `services/[id]/route.ts:18-26`, `portfolio/route.ts`, `portfolio/[id]/route.ts`
- **Açıklama/Etki:** `slug @unique` ihlali (P2002), geçersiz FK (P2003), var olmayan id PATCH (P2025) yakalanmıyor → anlamsız 500. (`services DELETE` sarılı — tutarsızlık.)
- **Çözüm:** Mutasyonları try/catch'e al; P2002→409, P2003→400, P2025→404.

### [O-10] `media/upload`/`upload-url` — DB yazımı başarısızsa "success:true" + yetim Blob/Mux
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `media/upload/route.ts:342-395`, `upload-url/route.ts:90-99`
- **Açıklama/Etki:** Blob/Mux oluşup DB kaydı başarısız olursa yine `success:true` döner → yetim (izlenemez/silinemez) blob/asset; webhook eşleşmez.
- **Çözüm:** DB kaydını kritik adım say; başarısızlıkta blob'u `del()` ile geri al veya `success:false` dön; arka planda yetim-temizleme.

### [O-11] MediaPicker/ImagePicker — eşzamanlı klasör isteklerinde yarış (stale response)
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `media/media-picker.tsx:152-216`, `media/image-picker.tsx`
- **Açıklama/Etki:** Hızlı tıklamada geç dönen yavaş istek, yeni isteğin sonucunu ezer → yanlış klasör içeriği.
- **Çözüm:** `requestId` ref veya `AbortController` ile yalnızca son isteği uygula.

### [O-12] PageBuilder hidrasyon effect'i `initialPage` referansına bağlı
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `page-builder.tsx:52-54`
- **Açıklama/Etki:** `useEffect(() => setPage(initialPage), [initialPage, ...])` — prop her render'da yeni referans olursa store baştaki değere sıfırlanır → kaydedilmemiş değişiklik silinir.
- **Çözüm:** Bağımlılığı `[initialPage.id]` yap veya `hydratedRef` ile tek seferlik.

### [O-13] Bozuk Tailwind arbitrary value'lar (stiller uygulanmıyor) — çok dosyada
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `palette-editor.tsx:316,1499,1536`, `sortable-canvas.tsx:174`, `back-to-top.tsx:35`, `contact-form.tsx:319,373`, `ai-studio.tsx:381,434`, `permission-matrix.tsx:363` vb.
- **Açıklama/Etki:** `bg-[#F7F7F5]]` (fazla `]`), boşluklu `rgba(255, 79, 216,0.x)`, `shadow-[var(--success),0.4)]`, `bg-[#ff4fd8]/0.12]` gibi geçersiz değerler derlenmez → gölge/arka plan/efektler sessizce uygulanmaz.
- **Çözüm:** Boşlukları kaldır (`rgba(255,79,216,0.x)`), fazla parantezleri düzelt, opacity'yi `/12` formatında yaz. Proje genelinde grep ile tara.

### [O-14] ColorField geçersiz girişte sessizce eski değere dönmüyor
- **Önem:** Orta · **Kategori:** Erişilebilirlik/Hata · **Konum:** `palette-editor.tsx:307-321,240-247`
- **Açıklama/Etki:** `commitInput` geçersizde `onChange` çağırmıyor ama `inputVal`'i de geri almıyor → input bozuk metni gösterirken renk değişmez; hata bildirimi yok.
- **Çözüm:** Blur'da geçersizse `setInputVal(value)` veya görünür hata sınıfı.

### [O-15] PaletteEditor `handleDeleteFont` — DELETE'te `Content-Type` yok + `res.ok` yok
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `palette-editor.tsx:1018-1029`
- **Açıklama/Etki:** JSON body gönderiliyor ama header yok; sunucu Content-Type'a göre parse ediyorsa body okunamaz; başarısızlık sessizce yutuluyor.
- **Çözüm:** `headers: {"Content-Type":"application/json"}` + `if (!res.ok) throw`.

### [O-16] SortableCanvas DragGhost — `meta` null erişimi + bozuk class
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `sortable-canvas.tsx:174,182-183`
- **Açıklama/Etki:** `DragGhost`'ta `meta.label` doğrudan kullanılıyor (SortableItem'da güvenli `meta?.label`); registry'de kayıtsız `section.type` olursa sürüklemede çökme. Ayrıca `bg-[#ff4fd8]/0.12]` geçersiz.
- **Çözüm:** `{meta?.label ?? section.type}`; `bg-[#ff4fd8]/12`.

### [O-17] Parasal/sonuç verisi yapısız `Json`/`String` (results + resultStats tekrarı)
- **Önem:** Orta · **Kategori:** Kod Kalitesi · **Konum:** `prisma/schema.prisma` `PortfolioItem.results/resultStats`; `seed.ts:113-118`
- **Açıklama/Etki:** Değerler `"500K₺"`, `"4.2x"` gibi string; şema garantisi yok; iki alan benzer veriyi tutuyor (senkron riski); sayısal işlem yapılamaz.
- **Çözüm:** Tek yapılandırılmış (Zod-doğrulamalı) model; sayısal değer + sunum formatı ayrı.

### [O-18] `src/types/index.ts` ↔ `page-builder.ts` tip tutarsızlığı
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `src/types/index.ts:40-79` vs `src/types/page-builder.ts:8-44`
- **Açıklama/Etki:** İki ayrı `SectionType`/`SectionBlock`/`PageData` ve uyuşmuyor (ör. `index.ts` `status` yerine `isPublished` kullanıyor, section listesi farklı). Hangi tip import edilirse farklı sözleşme dayatılır → runtime'da `undefined` props riski.
- **Çözüm:** Tek kaynak (`page-builder.ts`); `index.ts` kopyalarını kaldır/re-export et.

### [O-19] Page Builder store — bazı mutasyonlar history'ye yazmıyor (undo/redo tutarsız)
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `src/store/page-builder.ts:169-204`
- **Açıklama/Etki:** `updateSectionProps`/`updateSectionTransition`/`toggleSectionStickyPin` `pushHistory` çağırmıyor ve `future`'ı temizlemiyor; prop değişikliği undo'lanamaz, redo bayat state'e dönebilir.
- **Çözüm:** Bu mutasyonlara (debounce'lı) `pushHistory` ekle; en azından `future: []`.

### [O-20] `SectionBlock` `[key: string]: any` — tip güvenliği boşluğu
- **Önem:** Orta · **Kategori:** Kod Kalitesi · **Konum:** `src/types/page-builder.ts:60`
- **Açıklama/Etki:** Index signature `any` → her erişim tip kontrolünden çıkar; typo'lar derlemede yakalanmaz (eslint `no-explicit-any` "warn").
- **Çözüm:** `any` yerine `unknown`; opsiyonel alanları (`stickyPin?`, `transition?`) açıkça tiple.

### [O-21] `markdown-renderer` görsel URL'si doğrulanmıyor (XSS değil; SSRF/tracking) — ✓ Doğrulandı (severity kalibre edildi)
- **Önem:** Orta · **Kategori:** Güvenlik · **Konum:** `src/components/public/blog/markdown-renderer.tsx:104-116`
- **Açıklama/Etki:** `![alt](url)` → `<img src={url}>`; URL protokol doğrulaması yok. React attribute'leri escape ettiğinden **XSS değil**, ancak keyfi harici kaynağa istek (SSRF/izleme pikseli/mixed content). Proje genelinde admin HTML için DOMPurify kullanılırken bu renderer hiç doğrulama yapmıyor (tutarsız).
- **Çözüm:** Protokol allow-list (`/^(https?:|\/)/`) veya `next/image` + `remotePatterns`. Tam markdown/güvenlik için `react-markdown` + `rehype-sanitize` değerlendir.

### [O-22] `ScrollIndicator` / `hero-video` — sonsuz animasyon `prefers-reduced-motion`'ı yok sayıyor
- **Önem:** Orta · **Kategori:** Erişilebilirlik · **Konum:** `hero/scroll-indicator.tsx:22-26`, `hero/hero-video.tsx:107-122`
- **Açıklama/Etki:** Framer Motion `repeat: Infinity` ve autoplay video, CSS `@media (prefers-reduced-motion)` kuralından etkilenmez; `useReducedMotion()` yok. Video poster/aria-hidden de yok.
- **Çözüm:** `useReducedMotion()` ile repeat'i kapat; reduced-motion'da videoyu poster'a düşür, dekoratif videoya `aria-hidden`.

### [O-23] `contact-info` — gösterilen e-posta ≠ `mailto` + hardcoded (3 farklı adres)
- **Önem:** Orta · **Kategori:** Hata/Mantık · **Konum:** `contact/contact-info.tsx:130-134`
- **Açıklama/Etki:** Görünen `iletisim@flixflex.com` ama `href: mailto:contact@flixflex.com`; kullanıcı yanlış adrese yazar. Footer DB'den `siteSettings` çekerken burası hardcoded; FAQ'da `hello@flixflex.com` → 3 farklı adres.
- **Çözüm:** `mailto`'yu görünenle eşitle; `siteSettings`'ten besle (footer ile aynı kaynak).

### [O-24] `WovenLightHero` — runtime'da Google Fonts `<link>` enjeksiyonu (next/font bypass)
- **Önem:** Orta · **Kategori:** Performans · **Konum:** `ui/woven-light-hero.tsx:24-29`
- **Açıklama/Etki:** Mount'ta Playfair/Inter için `<link>` DOM'a ekleniyor; proje `next/font/google` kullanıyor → FOUT/layout shift, ekstra harici istek, CSP zorlaştırma.
- **Çözüm:** `next/font/google` ile ekle veya mevcut `--font-display`'i kullan; runtime enjeksiyonu kaldır.

### [O-25] Çok sayıda optimize edilmemiş `<img>` (next/image yerine)
- **Önem:** Orta · **Kategori:** Performans · **Konum:** `blog-card.tsx:41`, `featured-post.tsx:32`, `portfolio/gallery.tsx:65`, `portfolio/prev-next.tsx:28,61`, `modern-manifesto.tsx:175,256`, `content/portfolio-editor.tsx`, `service-editor.tsx:729`, `media-picker.tsx` vb.
- **Açıklama/Etki:** Ham `<img>` (çoğu `eslint-disable`'lı) responsive srcset/AVIF-WebP/CLS koruması sağlamıyor; `featured-post`/`prev-next` büyük kapaklar. Bazı yerlerde `next/image` doğru kullanılmış (tutarsız).
- **Çözüm:** Liste/kart kapaklarında `next/image` (`fill`+`sizes`); harici kaynaklar için `remotePatterns`/`unoptimized`.

---

## 🟢 DÜŞÜK BULGULAR

### [D-1] Tutarsız hata yanıt şekilleri + `catch (err: any)`
- **Önem:** Düşük · **Kategori:** Kod Kalitesi · **Konum:** `profile/route.ts` (`{error}`) vs `users/route.ts` (`{ok,message}`); çok dosyada `catch (err:any)`
- **Çözüm:** Tek yanıt zarfı standardı (`{ok,message}`); `catch (err: unknown)`.

### [D-2] `verifyApiKey` ölü kod / scope enforcement yok
- **Önem:** Düşük · **Kategori:** Kod Kalitesi/Güvenlik · **Konum:** `src/lib/api-keys.ts:38-58`
- **Açıklama:** API key'ler `scopes` ile üretiliyor ama `verifyApiKey` hiçbir route'da çağrılmıyor; scope hiç enforce edilmiyor.
- **Çözüm:** Özelliği tamamla (verify + scope) veya kaldır.

### [D-3] Dev fallback admin kimlik bilgileri koda gömülü (gated)
- **Önem:** Düşük · **Kategori:** Güvenlik · **Konum:** `src/lib/auth/index.ts:121-122`
- **Açıklama:** Dev fallback (`admin@flixflex.com`/`FlixFlex2026!`) üç koşulla kapılı (prod'da etkin değil) — düşük risk. Asıl risk K-2'de (seed).
- **Çözüm:** Mevcut gating yeterli; seed tarafını (K-2) sıkılaştır.

### [D-4] `appointments/[id]` PATCH Zod'suz; `meetLink` `Math.random`
- **Önem:** Düşük · **Kategori:** Güvenlik/Kod Kalitesi · **Konum:** `appointments/[id]/route.ts:12-18,46-47`
- **Çözüm:** Gövdeyi Zod ile doğrula; gerçek Meet entegrasyonu yoksa link üretimini netleştir.

### [D-5] `blog-store.createPost` slug çakışma yönetimi tutarsız (create fırlatır, update yutar)
- **Önem:** Düşük · **Kategori:** Hata/Mantık · **Konum:** `src/lib/ai/blog-store.ts:162-209`
- **Çözüm:** Slug çakışmasında benzersiz sonek ekle veya P2002→409; create/update hata stratejilerini uyumlu yap.

### [D-6] Düzenlenebilir listelerde `key={index}`
- **Önem:** Düşük · **Kategori:** Hata/Mantık · **Konum:** `portfolio-editor.tsx:633,712,851`, `service-editor.tsx:345`, `array-fields.tsx:48`, `ai-studio.tsx:511,644,666,881`
- **Açıklama:** Öğe silindiğinde React yanlış DOM eşleştirebilir → controlled input odak/değer kayması.
- **Çözüm:** Stabil id ile key.

### [D-7] Native `confirm()`/`alert()` (tutarsız UX, bloklayıcı)
- **Önem:** Düşük · **Kategori:** Kod Kalitesi/Erişilebilirlik · **Konum:** `palette-editor.tsx:1019,1139,1143`, `blog-list.tsx:79`, `api-keys-form.tsx:53`
- **Açıklama:** Proje başka yerlerde Radix Dialog onay modali kullanıyor (tutarsız).
- **Çözüm:** Mevcut `ConfirmDeleteDialog`/Radix Dialog desenini kullan.

### [D-8] Profile/Password form — `<label>` `htmlFor` bağı yok + `#6666666` typo
- **Önem:** Düşük · **Kategori:** Erişilebilirlik/Kod Kalitesi · **Konum:** `profile/profile-form.tsx:76-102`, `profile/password-form.tsx:124`
- **Çözüm:** `FFInput`'un kendi `label` prop'unu kullan (htmlFor'u bağlar); `#6666666`→`#666666`.

### [D-9] AdminTopbar bildirimleri hardcoded mock + tıklanabilir `<span>` (ölü/erişilemez)
- **Önem:** Düşük · **Kategori:** Kod Kalitesi/Erişilebilirlik · **Konum:** `layout/admin-topbar.tsx:144-228`
- **Açıklama:** Rozet sabit "3"; "Tümünü okundu işaretle" `<span>` + `cursor-pointer` ama `onClick` yok (klavyeyle erişilemez).
- **Çözüm:** Gerçek veri bağlanana kadar etkileşimli görünümü kaldır veya `<button>`+handler.

### [D-10] `useHistory` ölü kod (store ile çakışan ikinci undo/redo)
- **Önem:** Düşük · **Kategori:** Kod Kalitesi · **Konum:** `src/hooks/use-history.ts:22-73`
- **Çözüm:** Kullanılmıyorsa sil; tek geçmiş kaynağı store olsun. (`useUndoRedoKeys` kalabilir.)

### [D-11] `next.config.ts` — sabit LAN IP + prod CSP'de `'unsafe-inline'`
- **Önem:** Düşük · **Kategori:** Güvenlik/Kod Kalitesi · **Konum:** `next.config.ts:11,65-76`
- **Açıklama:** `allowedDevOrigins: ["10.3.5.57"]` koda gömülü; CSP genel olarak iyi (HSTS, frame-ancestors 'none', X-Frame-Options DENY) ama `script-src`'de prod'da `'unsafe-inline'` var.
- **Çözüm:** Nonce tabanlı script-src'ye geç, prod'da `'unsafe-inline'`'ı kaldır; IP'yi env'den oku.

### [D-12] Yaygın `as any` / sessiz fallback'ler (tip güvenliği & DX)
- **Önem:** Düşük · **Kategori:** Kod Kalitesi · **Konum:** `page-renderer.tsx:104-366` (`s.props as any`), `shared/theme-provider.tsx:135-147` (sessiz SSR fallback), `ui/woven-light-hero.tsx:19` (`/explore` default route — sitede yok)
- **Çözüm:** Section başına discriminated union; provider-dışı `useTheme`'de dev `console.warn`; default route'u mevcut bir yola (`/iletisim`) çek + `next/link`.

### [D-13] Minor perf — gereksiz her-render hesaplamaları
- **Önem:** Düşük · **Kategori:** Performans · **Konum:** `palette-editor.tsx:1037-1060` (memo dışı `initialSettings` → `JSON.stringify` etkisiz), `ai-studio.tsx:752,1007` (kelime sayımı her render)
- **Çözüm:** `useMemo` bağımlılıklarını düzelt.

### [D-14] ImagePicker hata durumunda boş grid (kullanıcıya hata yok)
- **Önem:** Düşük · **Kategori:** Hata/Mantık · **Konum:** `media/image-picker.tsx:44-57`
- **Açıklama:** `loadMedia` catch'inde `setItems` yok, `loading` finally'de kapanır → sebepsiz "boş kütüphane".
- **Çözüm:** Catch'te `error` state + dialog'da göster.

### [D-15] SortableItem — iç içe interaktif öğeler + ikon butonlarda `title` yerine `aria-label`
- **Önem:** Düşük · **Kategori:** Erişilebilirlik · **Konum:** `page-builder/sortable-canvas.tsx:79-118`
- **Açıklama:** Dış `div[role=button][tabIndex=0]` içinde `button` (drag handle) → klavyede çift durak/ekran okuyucuda belirsizlik; Eye/Copy/Trash butonları `title` kullanıyor.
- **Çözüm:** Seçimi ayrı görünür butona taşı; ikon butonlara `aria-label` ekle.

---

## ✅ OLUMLU GÖZLEMLER (doğru yapılmış)

- **Auth temelleri sağlam:** bcryptjs (cost 12); login'de sabit-zaman dummy-hash ile kullanıcı numaralandırma savunması; TOTP'de `crypto.timingSafeEqual` + replay önleme (`twoFactorLastUsedStep`) + atomik backup-kod tüketimi; backup kodları SHA-256 hash.
- **Yetki yükseltme savunması:** kendi rolünü düzenleyememe, sahip olunmayan izni atayamama (`roles/[id]/permissions`, `users/[id]`).
- **At-rest şifreleme:** secret'lar AES-256-GCM; API key'ler plaintext değil hash; liste sorgularında `omit: { password: true }`.
- **Güvenlik başlıkları kapsamlı:** HSTS, CSP, X-Frame-Options DENY, frame-ancestors 'none', Permissions-Policy (`next.config.ts`).
- **TS `strict: true`**; env katmanı Zod ile server/client ayrımı, secret'ları `NEXT_PUBLIC_` dışında tutuyor.
- **Sanitizasyon:** `lib/sanitize.ts` (isomorphic DOMPurify) admin HTML'de tutarlı kullanılıyor; blog markdown React üzerinden escape ediliyor (ham innerHTML enjeksiyonu yok).
- **A11y/perf örnek desenler:** `StarField`/`Reveal`/`Magnetic`/`PageTransition` `prefers-reduced-motion`'ı doğru uyguluyor (StarField ayrıca IntersectionObserver + visibilitychange ile CPU tasarrufu); `layout.tsx` skip-to-content + FOUC önleme; `FaqAccordion`/`ThemeToggle` tam erişilebilir; Three.js dinamik import (`ssr:false`).
- **Public yazma route'ları** (contact/appointments) rate-limit + Zod doğrulamalı; `media/upload`'da pixel-bomb limiti + SVG reddi.

---

## YÖNTEM & GÜVEN NOTU

- Bu denetim **salt-okunur**dur; hiçbir dosya değiştirilmedi.
- Bulgular 5 paralel uzman ajan tarafından dosya-dosya okunarak üretildi; **manşet/kritik bulgular ana denetçi tarafından elle doğrulandı** (`✓ Doğrulandı` etiketli: K-1, K-2, Y-7, Y-8, O-21 + email/api-utils zinciri).
- Severity'ler kullanıcının tanımlarına göre kalibre edildi; özellikle birkaç "Kritik XSS" iddiası, React'in attribute escape davranışı nedeniyle Orta/Yüksek'e indirildi (markdown `<img>` XSS değil → O-21; iframe daha ciddi → Y-17).
- Doğrulanmamış (yalnızca ajan-raporlu) bulgularda satır numaraları büyük oranda isabetli olsa da, düzeltmeden önce ilgili dosyanın tek tek teyidi önerilir.
- Önerilen düzeltme sırası: **Kritikler (K-1, K-2)** → **güvenlik Yüksekleri (Y-1…Y-11, Y-15, Y-17)** → **veri modeli/perf (Y-12, Y-13, Y-14)** → **a11y (Y-16, Y-20, Y-21)** → Orta/Düşük.
