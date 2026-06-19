-- AlterTable
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "folderId" TEXT;

-- AlterTable
ALTER TABLE "portfolio_items" ADD COLUMN IF NOT EXISTS "clientLogo" TEXT;

-- AlterTable
ALTER TABLE "services" 
ADD COLUMN IF NOT EXISTS "accentColor" TEXT,
ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
ADD COLUMN IF NOT EXISTS "gradient" TEXT,
ADD COLUMN IF NOT EXISTS "parentId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "media_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "appointments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT 'Ön Görüşme',
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "meetLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "blocked_slots" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "media_folders_name_parentId_key" ON "media_folders"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "blocked_slots_date_key" ON "blocked_slots"("date");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_parentId_fkey'
    ) THEN
        ALTER TABLE "services" ADD CONSTRAINT "services_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'media_folderId_fkey'
    ) THEN
        ALTER TABLE "media" ADD CONSTRAINT "media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'media_folders_parentId_fkey'
    ) THEN
        ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "media_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

