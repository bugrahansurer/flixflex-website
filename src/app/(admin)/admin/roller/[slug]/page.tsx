// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/roller/[slug] — Role detail/edit
// Slug, rol adından anlık türetilir (DB kolonu yok). Eski cuid ID
// linkleri slug URL'sine yönlendirilir.
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Lock } from "@/lib/icons"
import prisma from "@/lib/prisma"
import { slugifyTr } from "@/lib/utils"
import { FFContainer } from "@/components/ui/ff-container"
import { FFBadge } from "@/components/ui/ff-badge"
import { RoleForm } from "@/components/admin/rbac/role-form"
import { PermissionMatrix } from "@/components/admin/rbac/permission-matrix"

export const dynamic = "force-dynamic"

const LIST_URL = "/admin/roller"

type Props = { params: Promise<{ slug: string }> }

/** Slug ile rolü bulur; bulunamazsa eski cuid ID kabul edip slug URL'sine yönlendirir. */
async function resolveRole(slugOrId: string): Promise<{ id: string; redirectTo: string | null } | null> {
  if (!prisma) return null
  const all = await prisma.role.findMany({ select: { id: true, name: true } })
  const bySlug = all.find((r) => slugifyTr(r.name) === slugOrId)
  if (bySlug) return { id: bySlug.id, redirectTo: null }
  const byId = all.find((r) => r.id === slugOrId)
  if (byId) return { id: byId.id, redirectTo: `${LIST_URL}/${slugifyTr(byId.name)}` }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolveRole(slug)
  if (!resolved || !prisma) return { title: "Rol Düzenle — FlixFlex Admin" }
  const role = await prisma.role.findUnique({ where: { id: resolved.id }, select: { name: true } })
  return { title: role ? `${role.name} — FlixFlex Admin` : "Rol Düzenle — FlixFlex Admin" }
}

export default async function RoleDetailPage({ params }: Props) {
  const { slug } = await params

  if (!prisma) {
    return (
      <div className="px-6 md:px-10 py-8">
        <p className="text-sm text-[var(--foreground-muted)]">
          Veritabanı bağlantısı kurulamadı. DATABASE_URL kurulunca tekrar deneyin.
        </p>
      </div>
    )
  }

  const resolved = await resolveRole(slug)
  if (!resolved) notFound()
  if (resolved.redirectTo) redirect(resolved.redirectTo)

  const role = await prisma.role.findUnique({
    where: { id: resolved.id },
    include: { permissions: true },
  })

  if (!role) notFound()

  const isSuperAdmin = role.name === "Super Admin"
  const isSystem = role.isSystem

  return (
    <div className="px-6 md:px-10 py-8 space-y-8">
      {/* Back + breadcrumb */}
      <Link
        href={LIST_URL}
        className="ff-shape-button inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Rollere Dön
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
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
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-[var(--foreground-muted)]">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
