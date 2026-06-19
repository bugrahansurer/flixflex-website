-- AlterTable
ALTER TABLE "portfolio_items" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#FF4FD8',
ADD COLUMN     "gradient" TEXT NOT NULL DEFAULT 'from-[#1A1A1A] via-[#2A1A3A] to-[#3D1A5C]',
ADD COLUMN     "narrativeParagraphs" JSONB,
ADD COLUMN     "resultStats" JSONB,
ADD COLUMN     "sidebarItems" JSONB,
ADD COLUMN     "tall" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Globe',
    "features" TEXT[],
    "processSteps" JSONB NOT NULL DEFAULT '[]',
    "deliverables" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PortfolioServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PortfolioServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "_PortfolioServices_B_index" ON "_PortfolioServices"("B");

-- AddForeignKey
ALTER TABLE "_PortfolioServices" ADD CONSTRAINT "_PortfolioServices_A_fkey" FOREIGN KEY ("A") REFERENCES "portfolio_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PortfolioServices" ADD CONSTRAINT "_PortfolioServices_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
