# Kullanıcı Adı (username) Sistemi + Kullanıcı Detay Sayfası Redesign

**Tarih:** 2026-06-29
**Durum:** Onaylandı (tasarım)

## Amaç

Admin kullanıcı detay linklerinin DB cuid'i yerine (`/admin/kullanicilar/cmp0zoipb0003o6mg5tcipw7f`) okunabilir bir **kullanıcı adı** ile oluşması (`/admin/kullanicilar/omerustagul`). Her kullanıcıya benzersiz bir `username` verilir. Detay sayfası, mevcut tasarım dili korunarak daha kompakt ve modern hâle getirilir ve username alanı eklenir.

## Kararlar

1. **Username üretimi:** Ad + Soyad birleşik (≥2 kelime → ilk + son kelime), Türkçe karakterler sadeleştirilir, sadece `a-z0-9`. Alan düzenlenebilir. Çakışmada sona sayı eklenir (`omerustagul2`). Örnek: "Ömer Baran Ustagül" → `omerustagul`.
2. **Route:** `[id]` → `[username]`. Eski ID linkleri çalışmaya devam eder; bulununca username URL'sine `redirect()` ile yönlendirilir.
3. **Migration:** Local Postgres'te geliştirilir/test edilir; production'a `migrate deploy`'u kullanıcı yapar. İş bitince `DATABASE_URL` tekrar prod'a alınır.
4. **Kapsam dışı (YAGNI):** Username ile login yok (giriş yine e-posta ile). Username yalnızca URL + kimlik gösterimi.

## Veri Modeli

`prisma/schema.prisma` — `User` modeline:

```prisma
username String @unique
```

NOT NULL'a güvenli geçiş için iki adımlı migration + backfill:

1. **Migration A** — `username` kolonunu **nullable + unique index** olarak ekler.
2. **`scripts/backfill-usernames.ts`** — `username IS NULL` olan tüm kullanıcılara `generateUsername` ile değer üretir; çakışmaları `ensureUnique` ile çözer. İdempotent.
3. **Migration B** — kolonu **NOT NULL** yapar.

### Production deploy sırası (kullanıcı çalıştırır)
```
prisma migrate deploy        # Migration A
tsx scripts/backfill-usernames.ts
prisma migrate deploy        # Migration B
```
Prod'da yalnızca 2 kullanıcı olduğundan risk minimal.

## Username Yardımcıları — yeni `src/lib/username.ts`

- `transliterateTr(s: string): string` — `ç→c, ğ→g, ı→i, İ→i, ö→o, ş→s, ü→u` (büyük/küçük).
- `generateUsername(name: string | null, email: string): string`
  - name ≥2 kelime → ilk + son kelime
  - name 1 kelime → o kelime
  - name yok → e-posta öneki (`@` öncesi)
  - sonra: transliterate → lowercase → `[^a-z0-9]` temizle
- `ensureUniqueUsername(base, exists: (u) => Promise<boolean>): Promise<string>` — `base`, `base2`, `base3`…
- Format kuralı (manuel düzenleme): `^[a-z0-9._-]{3,30}$`.

## API & Doğrulama

`src/lib/validators/user-schema.ts`:
- `createUserSchema`: `username` opsiyonel + format regex. Boşsa API isimden üretir.
- `updateUserSchema`: `username` opsiyonel + format regex.

`src/app/api/users/route.ts` (POST) ve `src/app/api/users/[id]/route.ts` (PATCH):
- E-posta kontrolüne paralel **username benzersizlik** kontrolü (çakışmada `{ username: [...] }` hatası).
- POST'ta username verilmemişse `generateUsername` + `ensureUnique` ile üret.

## Routing

- `src/app/(admin)/admin/kullanicilar/[id]/` klasörü → `[username]/` olarak yeniden adlandırılır; param `username`.
- Sayfa: `prisma.user.findUnique({ where: { username } })`.
  - Bulunamazsa: `findUnique({ where: { id: username } })` → bulunursa `redirect('/admin/kullanicilar/' + user.username)`; yoksa `notFound()`.
- `generateMetadata` aynı çözümleme mantığını kullanır.
- Linkler `user.id` yerine `user.username`:
  - `kullanicilar/page.tsx:201` (liste satırı)
  - `user-form.tsx:83` (create sonrası redirect)

## Sayfa Redesign (kompakt & modern)

Mevcut tokenler korunur: `FFContainer`, `ff-card`, `FFBadge`, `#FF4FD8`, `font-display`.

- **Başlık kartı (tek):** avatar + isim + `@username` (mono chip) + e-posta + rol/durum badge'leri solda; `Sil` butonu sağda. Tek satır, kompakt.
- **İki kolon (2/3 + 1/3):**
  - Sol: "Bilgileri Düzenle" kartı (**username alanı dahil**) + "Şifre Değiştir" kartı.
  - Sağ: "Hesap Bilgileri" (rol/durum/son giriş/kayıt) + "Son Aktiviteler" (audit).
- Daha sıkı boşluk (`py-6`, `gap-6`), küçük bölüm başlıkları.

### UserForm değişikliği (`src/components/admin/rbac/user-form.tsx`)
- Yeni **username** alanı: `@` ön ekli `FFInput` + altında URL önizlemesi (`/admin/kullanicilar/<username>`).
- Yeni kullanıcı formunda: ad yazılınca username otomatik önerilir (kullanıcı override edebilir).
- `initial`'a `username` eklenir; PATCH/POST gövdesine username dahil edilir.

## Dokunulacak Dosyalar

- `prisma/schema.prisma` (+ 2 migration)
- `scripts/backfill-usernames.ts` (yeni)
- `src/lib/username.ts` (yeni)
- `src/lib/validators/user-schema.ts`
- `src/app/api/users/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/app/(admin)/admin/kullanicilar/[username]/page.tsx` (taşınır + redesign)
- `src/app/(admin)/admin/kullanicilar/page.tsx` (link)
- `src/app/(admin)/admin/kullanicilar/yeni/page.tsx` (roles + form)
- `src/components/admin/rbac/user-form.tsx` (username alanı)

## Test / Doğrulama

- `generateUsername` birim davranışı: "Ömer Baran Ustagül" → `omerustagul`; çakışma → `omerustagul2`; ad yok → e-posta öneki.
- Local migrate + backfill sonrası: mevcut kullanıcılarda username dolu ve benzersiz.
- Route: `/admin/kullanicilar/omerustagul` açılır; eski `/<id>` → username'e redirect.
- API: PATCH ile username değişimi benzersizlik/format kontrolü; aynı username başkasına atanamaz.
- `tsc --noEmit` temiz.
