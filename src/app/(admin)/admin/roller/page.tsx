// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/roller — Roles list page (Server Component)
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Users, ShieldCheck, Edit2 } from "@/lib/icons"
import prisma from "@/lib/prisma"
import { FFBadge } from "@/components/ui/ff-badge"
import { FFButton } from "@/components/ui/ff-button"
import { DeleteRoleButton } from "@/components/admin/rbac/delete-role-button"

export const metadata: Metadata = { title: "Roller — FlixFlex Admin" }
export const dynamic = "force-dynamic"

export default async function RolesPage() {
  let roles: Array<{
    id: string
    name: string
    description: string | null
    isSystem: boolean
    _count: { users: number }
    permissions: { id: string; resource: string; action: string }[]
  }> = []

  if (prisma) {
    roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "asc" },
    })
  }

  return (
    <div className="px-6 md:px-10 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#333333]">Roller</h1>
          <p className="text-xs text-[#666666] mt-1">
            Erişim seviyelerini ve sistem rollerini yönetin
          </p>
        </div>
        <Link href="/admin/roller/yeni">
          <FFButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Yeni Rol
          </FFButton>
        </Link>
      </div>

      {/* Table */}
      {roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#CCCCCC] text-center">
          <ShieldCheck className="w-10 h-10 text-[#666666] mb-4" />
          <p className="text-sm font-medium text-[#666666]">Henüz rol yok</p>
          <p className="text-xs text-[#666666] mt-1 mb-4">
            İlk rolü oluşturarak başlayın
          </p>
          <Link href="/admin/roller/yeni">
            <FFButton variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Yeni Rol Oluştur
            </FFButton>
          </Link>
        </div>
      ) : (
        <div className="ff-shape-container border border-[#CCCCCC] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-4 px-6 py-3 bg-[#f7f7f5] border-b border-[#CCCCCC]">
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#666666]">
              Rol Adı
            </span>
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#666666]">
              Açıklama
            </span>
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#666666] text-center">
              Kullanıcılar
            </span>
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#666666] text-center">
              İzinler
            </span>
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#666666] text-right">
              İşlemler
            </span>
          </div>

          {/* Rows */}
          {roles.map((role) => (
            <div
              key={role.id}
              className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-[#CCCCCC] last:border-b-0
                         hover:bg-[#f7f7f5] transition-colors items-center"
            >
              {/* Name + system badge */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-sm text-[#333333] truncate">
                  {role.name}
                </span>
                {role.isSystem && (
                  <FFBadge variant="purple">Sistem</FFBadge>
                )}
              </div>

              {/* Description */}
              <span className="text-sm text-[#666666] truncate">
                {role.description ?? <span className="opacity-40">—</span>}
              </span>

              {/* User count */}
              <div className="flex items-center justify-center gap-1 text-sm text-[#333333]">
                <Users className="w-3.5 h-3.5" />
                <span>{role._count.users}</span>
              </div>

              {/* Permission count */}
              <div className="text-center">
                <FFBadge variant="outline">{role.permissions.length}</FFBadge>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <Link href={`/admin/roller/${role.id}`}>
                  <FFButton
                    variant="ghost"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Düzenle
                  </FFButton>
                </Link>
                <DeleteRoleButton
                  roleId={role.id}
                  roleName={role.name}
                  isSystem={role.isSystem}
                  userCount={role._count.users}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
