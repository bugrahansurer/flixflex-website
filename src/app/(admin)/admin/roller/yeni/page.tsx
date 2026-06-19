// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/roller/yeni — New role page
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "@/lib/icons"
import { FFContainer } from "@/components/ui/ff-container"
import { RoleForm } from "@/components/admin/rbac/role-form"

export const metadata: Metadata = { title: "Yeni Rol — FlixFlex Admin" }

export default function NewRolePage() {
  return (
    <div className="px-6 md:px-10 py-8 space-y-6 max-w-2xl">
      {/* Back link */}
      <Link
        href="/admin/roller"
        className="ff-shape-button inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Rollere Dön
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Yeni Rol</h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Rol oluşturduktan sonra izin matrisini düzenleyebilirsiniz.
        </p>
      </div>

      {/* Form */}
      <FFContainer border="subtle" padding="lg">
        <RoleForm />
      </FFContainer>
    </div>
  )
}
