import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { PortfolioPageClient } from "./portfolio-page-client"

export const metadata: Metadata = { title: "Portfolyo Yönetimi" }

export default async function AdminPortfolioPage() {
  const items = prisma
    ? await prisma.portfolioItem.findMany({
      include: { services: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })
    : []

  return <PortfolioPageClient items={items} />
}
