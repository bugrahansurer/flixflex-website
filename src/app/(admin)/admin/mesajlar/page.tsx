import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCan } from "@/lib/rbac/server-can"
import prisma from "@/lib/prisma"
import { MessagesClient, type ContactMessage } from "@/components/admin/messages/messages-client"

export const metadata: Metadata = {
  title: "Mesajlar",
}

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
  const can = await getCan()
  if (!can("messages", "read")) redirect("/admin")

  let messages: ContactMessage[] = []
  if (prisma) {
    try {
      const rows = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
      })
      messages = rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        company: r.company,
        service: r.service,
        message: r.message,
        isRead: r.isRead,
        createdAt: r.createdAt.toISOString(),
      }))
    } catch (err) {
      console.error("[MessagesPage] mesajlar yüklenemedi:", err)
    }
  }

  return (
    <div className="px-6 md:px-10 py-6 space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-[var(--ff-purple)] mb-1">İletişim</p>
        <h1 className="font-display text-xl font-extrabold text-[#333333]">Mesajlar</h1>
        <p className="text-xs text-[#666666] mt-0.5">
          İletişim formundan gelen ziyaretçi mesajları
        </p>
      </div>

      <MessagesClient initial={messages} />
    </div>
  )
}
