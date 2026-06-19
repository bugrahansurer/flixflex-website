import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { ServiceEditor } from "@/components/admin/content/service-editor"

export const metadata: Metadata = { title: "Yeni Hizmet" }

export default async function NewServicePage() {
  const allServices = prisma
    ? await prisma.service.findMany({ select: { id: true, title: true, slug: true }, orderBy: { order: "asc" } })
    : []

  return <ServiceEditor mode="new" allServices={allServices} />
}
