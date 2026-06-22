# FlixFlex — Düzeltme Yol Haritası

**Kaynak:** `KOD-DENETIM-RAPORU.md` (65 bulgu)
**Tarih:** 2026-06-22
**Durum:** Plan — **henüz hiçbir düzeltme yapılmadı.**

> **Not (sayım düzeltmesi):** Denetim raporunun özet tablosu 63 bulgu diyordu; ID bazlı yeniden sayımda **Yüksek 23, Orta 25** çıktı → gerçek toplam **65**. Bu yol haritası ID bazlı doğru sayıyı kullanır.
>
> **Önemli:** Fazlar yalnızca rapor severity'sini kopyalamaz; **gerçek aciliyete** (aktif sömürülebilir güvenlik / veri kaybı / çökme) göre dizilmiştir. Bu yüzden bazı "Yüksek" güvenlik ve veri-kaybı maddeleri **Faz 1'e çekildi** — her maddenin orijinal rapor severity'si parantezde belirtildi.

---

## 0. Genel İlkeler & Çapraz Bağımlılıklar (her fazdan önce oku)

**Çalışma disiplini**
- Her faz ayrı branch/PR; her düzeltme sonrası **`npm run type-check` (tsc --noEmit)** + etkilenen sayfanın manuel testi.
- Küçük, atomik commit'ler (kolay geri alma).
- **Auth, secret ve şema** değişiklikleri önce **staging**'de; production'da feature-flag/aşamalı.

**Üç ortak ön-koşul (fazlara yayılır — erken planla):**

1. **Paylaşılan kalıcı rate-limit altyapısı** (Upstash Redis vb.)
   → Şu bulguların ortak temeli: **Y-1 (2FA), Y-9 (login/public), Y-10 (AI/içerik)**. Mevcut `lib/rate-limit.ts` in-memory ve serverless'te etkisiz. Bu altyapı kurulmadan Y-1'in Faz 1'de gerçek koruması olmaz → **Faz 1 başlarken minimum bir limiter kurulmalı**, Faz 2'de tüm route'lara yaygınlaştırılmalı.

2. **Prisma migration grubu** (tek planlı bakım penceresi, veri ön-koşullarıyla)
   → **Y-2** (twoFactorPendingSecret alanı), **Y-7** (Appointment.date unique), **Y-12** (indeksler), **Y-13** (ApiKey/AuditLog ilişki+onDelete), **O-17** (results/resultStats). Her birinin **veri ön-koşulu** var (aşağıda). **Y-14 (build script migration hack)** bu grupla doğrudan etkileşir — migration pipeline'ı düzeltilmeden şema migration'ları riskli.

3. **RBAC izin tutarlılığı**
   → **K-1** (settings izni) ve **Y-4** (izin whitelist) doğru rol-izin atamalarına bağlı. Düzeltmeden önce: hangi rollerin gerçekten `settings:update` ve hangi `resource:"*"` izinlerine sahip olduğunu DB'de doğrula (özellikle Super Admin'in `*` izniyle mi yoksa rol adıyla mı yetkilendirildiğini — `hasPermission` `*`'ı tam yetki sayıyor).

**Risk lejantı (bozma ihtimali):** 🟢 Düşük (izole, kolay geri al) · 🟡 Orta (davranış değişikliği / çok dosya / test gerekir) · 🔴 Yüksek (migration / auth / build / altyapı — staging zorunlu).

---

## FAZ 1 — Acil: Kritik güvenlik açıkları + veri kaybı/çökme
**9 bulgu · Hedef: en kısa sürede, ayrı acil sürüm.**

| ID | Özet | Bozma riski | Bağımlılık / ön-koşul |
|---|---|---|---|
| **K-1** (Kritik) | Email ayar route'ları `requireAdmin()`=`ai:create` ile korunuyor → SMTP/Resend secret sızıntısı + privesc. Doğru izne (`settings:read/update`) çevir. | 🟢 Düşük | RBAC: `settings` izni olan rollerin doğruluğunu teyit et (Genel #3). `email/test` (Y-5) ile aynı dosya grubunda yapılmalı. |
| **K-2** (Kritik) | Seed'de sabit `FlixFlex2026!` fallback + build her deploy seed çalıştırıyor. Fallback'i kaldır, prod'da `SEED_ADMIN_PASSWORD` yoksa hard-fail. | 🟡 Orta (kod 🟢; **operasyonel** risk) | **Önce** tüm ortamlara `SEED_ADMIN_PASSWORD` env'i tanımlanmalı, yoksa build kırılır. Mevcut deploy'larda bilinen şifre **acilen** değiştirilmeli. Y-14 (build) ile koordineli. |
| **Y-8** (Yüksek→F1) | Mux webhook imzası fail-open (`if (secret)`); prod'da secret zorunlu kıl. | 🟡 Orta (operasyonel) | **Önce** prod'da `MUX_WEBHOOK_SECRET` set edilmeli; yoksa video işleme webhook'ları 500 döner. |
| **Y-7** (Yüksek→F1) | Randevu çift-rezervasyon yarışı; `Appointment.date`'e unique + P2002 yakalama. | 🔴 Yüksek (migration) | **Migration grubu (#2).** Ön-koşul: mevcut tabloda **duplicate `date` temizliği**; "iptal edilen slot yeniden alınabilir mi?" kararına göre **tam vs kısmi (status-filtreli) unique** seç. Yanlış seçim meşru rezervasyonları engelleyebilir. |
| **Y-5** (Yüksek→F1) | `email/test` SSRF + validasyonsuz secret. Zod + private-IP/host engeli + yetkiyi `settings:update`'e bağla. | 🟡 Orta | **K-1 ile birlikte** (aynı izin düzeltmesi). Host allowlist çok darsa meşru SMTP sunucularını engelleyebilir → konfigüre edilebilir tut. |
| **Y-1** (Yüksek→F1) | 2FA enable/disable/setup'ta rate-limit + Zod yok (brute-force). | 🟡 Orta | **Ortak rate-limit altyapısına (Genel #1) bağımlı.** Limit çok düşükse meşru kullanıcı kilitlenebilir. |
| **Y-2** (Yüksek→F1) | 2FA setup mevcut faktörü doğrulamadan secret eziyor (hesap ele geçirme/kilitlenme). | 🔴 Yüksek (auth + migration) | **`twoFactorPendingSecret` alanı (migration grubu #2)** gerekir; 2FA kayıt akışı (UI + API) değişir → staging'de tam 2FA testi. |
| **Y-4** (Yüksek→F1) | Permission şeması whitelist değil; `*:*` yazılabilir (privesc). `z.enum(RESOURCE_LIST/ACTION_LIST)`. | 🟡 Orta | **RBAC ön-koşulu (Genel #3):** mevcut DB'de meşru `*` izni varsa (ör. seed'de Super Admin) enum reddeder → ya Super Admin'i rol-adıyla muaf tut ya da veriyi migrate et. Y-6 (audit) ile birlikte yapılması iyi. |
| **Y-18** (Yüksek→F1) | PageBuilder save/publish `res.ok` kontrol etmiyor → sessiz veri kaybı ("Kaydedildi" yanılgısı). | 🟢 Düşük | Yok (izole UI hata yönetimi). Hızlı kazanç. |

**Faz 1 toplu değerlendirme**
- **Düşük riskli hızlı kazançlar (önce bunlar):** K-1, Y-18 (izole, migration yok).
- **Operasyonel ön-koşul gerektirenler (env önce):** K-2, Y-8.
- **Migration gerektirenler (bakım penceresi):** Y-7, Y-2 → migration grubunda toplanmalı; **Y-14 (build script) bu noktada gözden geçirilmeli** ki migration'lar güvenle deploy edilsin.
- **Altyapı gerektiren:** Y-1 → rate-limit temeli (Genel #1).
- **Genel risk:** Auth/secret/migration ağırlıklı → **staging zorunlu.** Faz 1'in en riskli kalemleri Y-7 ve Y-2 (migration + auth davranışı).

---

## FAZ 2 — Yüksek öncelikli hatalar + büyük performans + güvenlik sertleştirme
**16 bulgu.**

### 2a. Güvenlik sertleştirme (sömürülebilir değil ama önemli)
| ID | Özet | Bozma riski | Bağımlılık |
|---|---|---|---|
| **Y-3** | Middleware `/api/*`'ı kapsamıyor (savunma derinliği); hassas API prefix'lerini matcher'a ekle / merkezi gate. | 🟡 Orta | Matcher değişikliği yanlışlıkla route bloklayabilir → dikkatli test. K-1 tipi hataların kök çözümü. |
| **Y-6** | Hassas mutasyonlarda audit log eksik (rol/profil/2FA/api-key). | 🟢 Düşük | `AuditLog` (Y-13) ilişki/indeks düzeltmesiyle uyumlu yapılmalı. |
| **Y-9** | Public/login rate-limit zayıf (XFF spoof + in-memory); güvenilir IP + kalıcı limiter + login limiti. | 🟡 Orta | **Genel #1 altyapısı.** Y-1, Y-10 buna dayanır → erken tamamla. |
| **Y-10** | AI/içerik mutasyon route'larında kalıcı rate-limit yok (maliyet/DoS). | 🟢 Düşük | **Y-9 altyapısına bağımlı.** |
| **Y-11** | `media/upload` MIME yalnızca client `file.type` (magic-byte yok). | 🟡 Orta | `file-type` paketi eklenir; algılama kusuru meşru dosyaları reddedebilir → tolerans test et. |
| **Y-17** | `video-embed` iframe `src` doğrulanmıyor; host allowlist + `sandbox`. | 🟡 Orta | Allowlist çok darsa meşru gömüleri bozar. |
| **Y-15** | `next-auth` beta caret ile; tam pin'le. | 🟢 Düşük | Lock dosyası. (GA'ya yükseltme ayrı, daha riskli bir iş — bu fazda sadece pin.) |

### 2b. Veri modeli & büyük performans (migration grubu)
| ID | Özet | Bozma riski | Bağımlılık |
|---|---|---|---|
| **Y-12** | Sık sorgulanan alanlarda indeks yok (isPublished/status/order/folderId/parentId/...). | 🟡 Orta | **Migration grubu (#2).** İndeks ekleme veri değiştirmez (görece güvenli) ama migration deploy'u Y-14'e bağlı. |
| **Y-13** | ApiKey/AuditLog ilişki + indeks + `onDelete` eksik (kullanıcı silme FK hatası + full-scan). | 🔴 Yüksek | **Migration + veri ön-koşulu:** dangling `createdById` değerleri varsa FK ilişkisi eklenince migration başarısız → önce temizle. |
| **Y-14** | Build script her deploy'da migration'ı zorla rolled-back + `\|\| true` hata yutuyor. | 🔴 Yüksek | **Migration drift'i kalıcı çözülmeden dokunma.** Tüm Faz 1/2 şema migration'larının ön-koşulu; yanlış müdahale **deploy'ları kırar.** Staging'de tam deploy provası. |

### 2c. İşlev hataları
| ID | Özet | Bozma riski | Bağımlılık |
|---|---|---|---|
| **Y-19** | PropertyEditor JSON (dizi/obje) alanları sessiz yutuyor + düzenlenemez. | 🟡 Orta | Property editör tüm alan tiplerinde regresyon testi. |
| **Y-22** | LoginCard "Beni hatırla" işlevsiz; `signIn`'e ilet + session maxAge. | 🟡 Orta | Auth config'e dokunur → session davranışı testi. |
| **Y-23** | WovenLightHero Three.js: reduced-motion yok + her frame ağır allocation. | 🟡 Orta | Görsel/performans; kullanıldığı sayfalarda test. |

### 2d. Erişilebilirlik
| ID | Özet | Bozma riski | Bağımlılık |
|---|---|---|---|
| **Y-16** | globals.css kontrast AA'yı karşılamıyor (muted/charcoal badge). | 🟢 Düşük | Salt CSS; görsel gözden geçirme. Tema editöründen üretilen paletleri de etkiler → token tutarlılığı. |
| **Y-20** | FFInput/FFTextarea hata mesajı `aria-describedby` ile bağlı değil. | 🟢 Düşük | Tüm formları etkiler (tek bileşen) — geniş fayda, düşük risk. |
| **Y-21** | modern-manifesto medya klavyeyle açılamıyor + modalde focus-trap/Escape yok. | 🟡 Orta | Radix Dialog'a geçiş; davranış testi. |

**Faz 2 toplu değerlendirme**
- **Erken yap:** Y-9 (rate-limit altyapısı — Y-1/Y-10'un ön-koşulu), Y-14 (migration pipeline — tüm şema değişikliklerinin ön-koşulu).
- **Migration grubu (Y-12, Y-13):** Faz 1'in Y-7/Y-2 migration'larıyla **tek bakım penceresinde** planla.
- **Düşük riskli geniş faydalar:** Y-6, Y-15, Y-16, Y-20.
- **En riskli kalemler:** Y-13, Y-14 (🔴 — veri/build).

---

## FAZ 3 — Orta öncelikli sorunlar + kod kalitesi
**25 bulgu (O-1…O-25). Çoğu izole, düşük-orta bozma riski.**

### 3a. Hata yönetimi & doğrulama (genelde 🟢/🟡)
- **O-3** son Super Admin / kendi hesabını pasifleştirme engeli — 🟡 (auth invariant; dikkatli test).
- **O-4** hata mesajı sızıntısı (err.message istemciye) — 🟢.
- **O-5** media PATCH/DELETE Zod + folderId doğrulama — 🟢.
- **O-6** appointments/slots yıl sınırı + block POST Zod — 🟢.
- **O-9** services/portfolio POST/PATCH Prisma hata eşleme (P2002/P2025) — 🟢.
- **O-10** media upload DB başarısızsa yetim Blob/Mux — 🟡 (rollback mantığı; dikkatli).
- **O-11** MediaPicker/ImagePicker istek yarışı (AbortController) — 🟢.
- **O-12** PageBuilder hidrasyon effect `[initialPage.id]` — 🟡 (yanlış yaparsan veri kaybı; **Y-18 ile birlikte** ele al).
- **O-14** ColorField geçersiz girişte geri alma — 🟢.
- **O-15** PaletteEditor font DELETE Content-Type + res.ok — 🟢.
- **O-16** SortableCanvas DragGhost `meta?.label` null koruması — 🟢 (çökme önler).

### 3b. Güvenlik/davranış (orta)
- **O-1** decryptSecret hatada throw/null — 🟡 (**2FA/email akışlarını etkiler**; K-1/Y-2'den **sonra**, çağıranları güncelleyerek).
- **O-2** JWT 8 saat — iptal gecikmesi; hassas işlemlerde DB doğrulama — 🟡 (auth davranışı).
- **O-7** AI `model` allowlist + prompt injection sınırları — 🟢.
- **O-8** pages route DB hatası sessizce in-memory'e düşüyor — 🟡 (fallback davranışı; veri tutarlılığı).
- **O-21** markdown görsel URL protokol allow-list (XSS değil; SSRF/tracking) — 🟢.

### 3c. Performans (orta)
- **O-22** ScrollIndicator/hero-video reduced-motion — 🟢.
- **O-24** WovenLightHero runtime Google Fonts enjeksiyonu → next/font — 🟡.
- **O-25** optimize edilmemiş `<img>` → next/image — 🟡 (çok dosya; görsel/layout testi).

### 3d. Veri modeli & tip tutarlılığı (orta — bazıları migration)
- **O-17** results/resultStats yapısız Json/String + tekrar — 🔴 (**migration + veri dönüşümü**; migration grubuna ekle).
- **O-18** `types/index.ts` ↔ `page-builder.ts` tip tutarsızlığı — 🟡 (paylaşılan tip; tek kaynağa indirgeme ripple yapabilir).
- **O-19** store bazı mutasyonlar history'ye yazmıyor (undo/redo) — 🟡.
- **O-20** SectionBlock `[key:string]: any` → unknown/açık alanlar — 🟡 (tip sıkılaştırma derleme hataları açığa çıkarabilir).
- **O-13** bozuk Tailwind arbitrary value'lar (çok dosyada) — 🟡 (düzeltince **gizli stiller görünür olur** → görsel değişim; toplu grep + görsel gözden geçirme).
- **O-23** contact-info mailto ≠ görünen e-posta + hardcoded — 🟢.

**Faz 3 toplu değerlendirme**
- Çoğunluk **izole, düşük riskli** — bağımsız küçük PR'larla ilerlenebilir.
- **Dikkat gerektirenler:** O-1 (auth akışları; K-1/Y-2 sonrası), O-12 (Y-18 ile), O-13 (görsel regresyon), O-17/O-18/O-20 (tip/şema ripple), O-25 (toplu `<img>` dönüşümü).
- **Migration gerektiren:** O-17 → migration grubuyla.

---

## FAZ 4 — Düşük öncelikli iyileştirmeler + kozmetik
**15 bulgu (D-1…D-15). Genelde 🟢 düşük risk.**

| ID | Özet | Risk |
|---|---|---|
| **D-1** | Tutarsız hata yanıt şekilleri + `catch(err:any)` standardizasyonu | 🟢 |
| **D-2** | `verifyApiKey` ölü kod — tamamla veya kaldır | 🟢 (kaldırmadan önce gerçekten kullanılmadığını teyit) |
| **D-3** | Dev fallback admin creds (gated) — mevcut gating yeterli, not | 🟢 |
| **D-4** | appointments/[id] PATCH Zod + meetLink üretimi | 🟢 |
| **D-5** | blog-store slug çakışma stratejisi | 🟢 |
| **D-6** | Düzenlenebilir listelerde `key={index}` → stabil id | 🟡 (input odak davranışı; test) |
| **D-7** | Native confirm()/alert() → Radix Dialog | 🟢 |
| **D-8** | Profile/Password form label `htmlFor` + `#6666666` typo | 🟢 |
| **D-9** | AdminTopbar mock bildirimler + tıklanabilir span | 🟢 |
| **D-10** | `useHistory` ölü kod kaldır | 🟢 (kullanılmadığını teyit) |
| **D-11** | next.config sabit LAN IP + prod CSP `'unsafe-inline'` | 🟡 (CSP sertleştirme inline script'leri bozabilir; dikkatli) |
| **D-12** | Yaygın `as any` / sessiz fallback'ler | 🟡 (tip sıkılaştırma ripple) |
| **D-13** | Minor perf (gereksiz her-render hesap) | 🟢 |
| **D-14** | ImagePicker hata durumunda boş grid | 🟢 |
| **D-15** | SortableItem iç içe interaktif öğeler + aria-label | 🟢 |

**Faz 4 toplu değerlendirme:** Çoğu kozmetik/temizlik. **Tek dikkat:** D-11 (CSP `'unsafe-inline'` kaldırma — nonce gerektirir, yanlışsa inline script'ler kırılır), D-6/D-12 (davranış/tip ripple). Gerisi serbestçe ele alınabilir.

---

## Çapraz-Faz Bağımlılık Haritası (özet)

```
Rate-limit altyapısı (Genel #1) ──► Y-1 (F1) ─┬─► Y-9 (F2) ──► Y-10 (F2)
                                              
Migration pipeline / Y-14 (F2) ──► [Migration grubu]:
        Y-2 (F1) · Y-7 (F1) · Y-12 (F2) · Y-13 (F2) · O-17 (F3)
        (her birinin VERİ ÖN-KOŞULU var: duplicate temizliği, dangling FK temizliği)

RBAC izin doğrulaması (Genel #3) ──► K-1 (F1) · Y-5 (F1) · Y-4 (F1)

K-1 / Y-2 (auth-secret) ──► O-1 (F3, decryptSecret davranışı çağıranları etkiler)
Y-18 (F1, kaydetme) ──► O-12 (F3, hidrasyon — birlikte ele al)
Y-13 (F2, AuditLog) ──► Y-6 (F2, audit yazımı)
```

## Önerilen Yürütme Sırası (pratik)

1. **Sprint 0 (hazırlık):** Tüm ortamlara `SEED_ADMIN_PASSWORD` + `MUX_WEBHOOK_SECRET` env'lerini ekle; rate-limit altyapısını (Upstash) kur; migration drift'ini (Y-14) staging'de incele.
2. **Sprint 1 (Faz 1 — hızlı kazançlar):** K-1, Y-18 (izole) → ardından K-2, Y-8, Y-5 (env hazır) → Y-1, Y-4.
3. **Sprint 2 (Faz 1+2 migration penceresi):** Y-14 düzelt → Y-2, Y-7, Y-12, Y-13 (+ O-17) tek bakım penceresinde, veri ön-koşullarıyla.
4. **Sprint 3 (Faz 2 kalanı):** Y-9/Y-10, Y-3, Y-6, Y-11, Y-15, Y-16, Y-17, Y-19, Y-20, Y-21, Y-22, Y-23.
5. **Sprint 4+ (Faz 3):** Orta bulgular, küçük bağımsız PR'lar (O-1, O-12, O-13, O-17, O-18 dışındakiler serbest).
6. **Boş zaman / sürekli (Faz 4):** Düşük/kozmetik.

> **Tüm fazlar için:** Her PR'da `tsc --noEmit`; auth/secret/şema değişikliklerinde staging zorunlu; CSP/build/migration kalemleri (Y-14, D-11, migration grubu) en yüksek dikkatle.
