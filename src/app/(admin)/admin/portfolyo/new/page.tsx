import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { PortfolioEditor } from "@/components/admin/content/portfolio-editor"

export const metadata: Metadata = { title: "Yeni Portfolyo" }

export default async function NewPortfolioPage() {
  const services = prisma
    ? await prisma.service.findMany({
      select: { id: true, title: true, slug: true, isPublished: true },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    })
    : []

  return <PortfolioEditor mode="new" services={services} />
}
