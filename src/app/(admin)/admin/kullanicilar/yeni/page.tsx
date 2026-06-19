// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/kullanicilar/yeni — New user page
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "@/lib/icons"
import prisma from "@/lib/prisma"
import { FFContainer } from "@/components/ui/ff-container"
import { UserForm } from "@/components/admin/rbac/user-form"

export const metadata: Metadata = { title: "Yeni Kullanıcı — FlixFlex Admin" }
export const dynamic = "force-dynamic"

export default async function NewUserPage() {
  let roles: { id: string; name: string }[] = []

  if (prisma) {
    roles = await prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  }

  return (
    <div className="px-6 md:px-10 py-8 space-y-6 max-w-2xl">
      <Link
        href="/admin/kullanicilar"
        className="ff-shape-button inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kullanıcılara Dön
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Yeni Kullanıcı</h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Yeni bir yönetici hesabı oluşturun.
        </p>
      </div>

      <FFContainer border="subtle" padding="lg">
        <UserForm roles={roles} />
      </FFContainer>
    </div>
  )
}
