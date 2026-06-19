-- Two-factor auth fields on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;

-- Blog cover gradient fallback (separate from real coverImage URL)
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "coverGradient" TEXT;

-- API keys
CREATE TABLE IF NOT EXISTS "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);
