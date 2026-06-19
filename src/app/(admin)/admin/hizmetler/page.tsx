import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { ServicesPageClient } from "./services-page-client"

export const metadata: Metadata = { title: "Hizmet Yönetimi" }

export default async function AdminServicesPage() {
  const items = prisma
    ? await prisma.service.findMany({
      include: {
        portfolios: true,
        children: true,
        parent: { select: { id: true, title: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })
    : []

  return <ServicesPageClient items={items} />
}
