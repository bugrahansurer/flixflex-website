// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/roller/[id] — Role detail/edit
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Lock } from "@/lib/icons"
import prisma from "@/lib/prisma"
import { FFContainer } from "@/components/ui/ff-container"
import { FFBadge } from "@/components/ui/ff-badge"
import { RoleForm } from "@/components/admin/rbac/role-form"
import { PermissionMatrix } from "@/components/admin/rbac/permission-matrix"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  if (!prisma) return { title: "Rol Düzenle — FlixFlex Admin" }
  const role = await prisma.role.findUnique({ where: { id }, select: { name: true } })
  return { title: role ? `${role.name} — FlixFlex Admin` : "Rol Düzenle — FlixFlex Admin" }
}

export default async function RoleDetailPage({ params }: Props) {
  const { id } = await params

  if (!prisma) {
    return (
      <div className="px-6 md:px-10 py-8">
        <p className="text-sm text-[var(--foreground-muted)]">
          Veritabanı bağlantısı kurulamadı. DATABASE_URL kurulunca tekrar deneyin.
        </p>
      </div>
    )
  }

  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  })

  if (!role) notFound()

  const isSuperAdmin = role.name === "Super Admin"
  const isSystem = role.isSystem

  return (
    <div className="px-6 md:px-10 py-8 space-y-8">
      {/* Back + breadcrumb */}
      <Link
        href="/admin/roller"
        className="ff-shape-button inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Rollere Dön
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
          {role.name}
        </h1>
        {isSystem && <FFBadge variant="purple">Sistem Rolü</FFBadge>}
        {isSuperAdmin && (
          <FFBadge variant="warning">
            <Lock className="w-3 h-3" />
            İzinler Kilitli
          </FFBadge>
        )}
      </div>

      {/* Role info form */}
      <section className="max-w-2xl space-y-3">
        <h2 className="text-xs font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)]">
          Rol Bilgileri
        </h2>
        <FFContainer border="subtle" padding="lg">
          <RoleForm
            initial={{
              id: role.id,
              name: role.name,
              description: role.description,
              isSystem: role.isSystem,
            }}
          />
        </FFContainer>
      </section>

      {/* Permission matrix */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)]">
            Yetki Matrisi
          </h2>
          {isSuperAdmin && (
            <p className="text-xs text-[var(--foreground-faint)]">
              Super Admin her zaman tam yetkiye sahiptir — düzenlenemez.
            </p>
          )}
        </div>
        <FFContainer border="subtle" padding="none">
          <PermissionMatrix
            roleId={role.id}
            initialPermissions={role.permissions}
            isLocked={isSuperAdmin}
          />
        </FFContainer>
      </section>
    </div>
  )
}
