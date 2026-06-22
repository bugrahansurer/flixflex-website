-- Phase 1 (Y-2 + Y-7) — kod denetimi düzeltmeleri. OTOMATİK UYGULANMADI.
-- Uygulamak için: npx prisma migrate deploy
-- ⚠️ `prisma migrate dev` KULLANMAYIN — aşağıdaki kısmi index şemada (schema.prisma)
--    ifade edilemediğinden `migrate dev` bunu "drift" sanıp KALDIRMAK ister.
--    Production akışı (`migrate deploy`) bu SQL'i ileri yönde uygular, sorun olmaz.

-- ── Y-2: yeniden-kayıt için bekleyen (pending) TOTP secret ───────────────────
-- (Re)enrollment sırasında kullanılan geçici secret; `enable` başarılı olunca
-- twoFactorSecret'e terfi eder. Böylece aktif secret, `setup` tarafından asla
-- ezilmez (oturum çalınsa bile rebind/DoS engellenir).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorPendingSecret" TEXT;

-- ── Y-7: aktif slotların çift-rezervasyonunu engelle ─────────────────────────
-- (date) üzerinde YALNIZCA aktif (pending/approved) randevular için kısmi unique;
-- iptal/tamamlanmış slotlar yeniden rezerve edilebilir. Prisma şeması kısmi unique
-- index'i ifade edemediği için ham SQL kullanıldı.
--
-- ÖN-KOŞUL: Mevcut aktif duplicate satır OLMAMALI, aksi halde CREATE başarısız olur.
-- Önce şununla doğrulayın (boş sonuç dönmeli):
--   SELECT "date", COUNT(*) FROM "appointments"
--   WHERE "status" IN ('pending','approved')
--   GROUP BY "date" HAVING COUNT(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS "appointments_active_date_unique"
  ON "appointments" ("date")
  WHERE "status" IN ('pending', 'approved');
