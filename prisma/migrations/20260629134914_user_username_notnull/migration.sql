-- Güvenlik ağı: NOT NULL'ı zorlamadan ÖNCE kalan null/boş username'leri doldur.
-- E-posta öneki (sadeleştirilmiş) + id ekiyle benzersiz ve dolu garantisi sağlar.
-- Daha güzel isimler için önce `scripts/backfill-usernames.ts` çalıştırılmalı —
-- o zaman bu UPDATE 0 satır etkiler ("omerustagul" gibi isimler korunur).
UPDATE "users"
SET "username" = substr(
  lower(regexp_replace(split_part("email", '@', 1), '[^a-z0-9]', '', 'g')) || substr("id", 1, 8),
  1, 30
)
WHERE "username" IS NULL OR "username" = '';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
