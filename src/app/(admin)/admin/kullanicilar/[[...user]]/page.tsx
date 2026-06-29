// ═══════════════════════════════════════════════════════════
// FlixFlex — /admin/kullanicilar[/<username>|/yeni] — Users list + drawer
//
// Tek sayfa (opsiyonel catch-all):
//   /admin/kullanicilar            → liste
//   /admin/kullanicilar/<username> → liste + düzenle drawer'ı
//   /admin/kullanicilar/yeni       → liste + yeni kullanıcı drawer'ı
// Eski cuid ID linkleri username path'ine yönlendirilir.
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, Search, Edit2, UserX, UserCheck } from "@/lib/icons"
import prisma from "@/lib/prisma"
import { getMockSession } from "@/lib/auth/mock-session"
import { FFBadge } from "@/components/ui/ff-badge"
import { FFButton } from "@/components/ui/ff-button"
import { FFInput } from "@/components/ui/ff-input"
import { UserDrawer } from "@/components/admin/rbac/user-drawer"
import { formatRelativeTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

const LIST_URL = "/admin/kullanicilar"

type Props = {
  params: Promise<{ user?: string[] }>
  searchParams: Promise<{ q?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segment = (await params).user?.[0]
  if (segment === "yeni") return { title: "Yeni Kullanıcı — FlixFlex Admin" }
  if (segment && prisma) {
    const u = await prisma.user.findUnique({ where: { username: segment }, select: { name: true, email: true } })
    if (u) return { title: `${u.name ?? u.email} — FlixFlex Admin` }
  }
  return { title: "Kullanıcılar — FlixFlex Admin" }
}

const getRoleBadgeVariant = (roleName: string): "purple" | "charcoal" | "outline" | "success" => {
  if (roleName === "Super Admin") return "purple"
  if (roleName === "Admin") return "charcoal"
  if (roleName === "Editor") return "success"
  return "outline"
}

function getInitials(name: string | null, email: string): string {
  const src = name?.trim() || email
  const parts = src.split(/\s+/)
  if (parts.length === 1) return (parts[0][0] + (parts[0][1] ?? "")).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default async function UsersPage({ params, searchParams }: Props) {
  const segment = (await params).user?.[0]
  const { q = "", page: pageStr = "1" } = await searchParams
  const page = Math.max(1, Number(pageStr))
  const limit = 20

  const session = await getMockSession()

  if (!prisma) {
    return (
      <div className="px-6 md:px-10 py-8">
        <p className="text-sm text-[#888888]">Veritabanı bağlantısı kurulamadı.</p>
      </div>
    )
  }

  // ── Drawer state from URL ──────────────────────────
  let drawerMode: "edit" | "new" | null = null
  let drawerUser:
    | {
        id: string
        name: string | null
        username: string
        email: string
        roleId: string
        isActive: boolean
        role: { name: string }
        lastLogin: Date | null
        createdAt: Date
      }
    | null = null
  let drawerAudit: { id: string; action: string; createdAt: Date }[] = []
  let drawerIsSelf = false

  if (segment === "yeni") {
    drawerMode = "new"
  } else if (segment) {
    const found = await prisma.user.findUnique({
      where: { username: segment },
      select: {
        id: true, name: true, username: true, email: true, roleId: true,
        isActive: true, lastLogin: true, createdAt: true,
        role: { select: { name: true } },
      },
    })
    if (found) {
      drawerMode = "edit"
      drawerUser = found
      drawerIsSelf = session?.user.id === found.id
      drawerAudit = await prisma.auditLog
        .findMany({ where: { userId: found.id }, orderBy: { createdAt: "desc" }, take: 10 })
        .catch(() => [])
    } else {
      // Eski cuid ID linki → username path'ine yönlendir; tanınmazsa listeye dön.
      const byId = await prisma.user.findUnique({ where: { id: segment }, select: { username: true } })
      redirect(byId ? `${LIST_URL}/${byId.username}` : LIST_URL)
    }
  }

  // ── List data ──────────────────────────────────────
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { username: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [users, total, roles] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, username: true, email: true, isActive: true, lastLogin: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
    prisma.role.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ])

  const pages = Math.ceil(total / limit)

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#0d0d0d]">Kullanıcılar</h1>
          <p className="text-xs text-[#888888] mt-1">{total} kullanıcı kayıtlı</p>
        </div>
        <Link href={`${LIST_URL}/yeni`}>
          <FFButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Yeni Kullanıcı
          </FFButton>
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action={LIST_URL} className="max-w-sm">
        <FFInput
          name="q"
          defaultValue={q}
          placeholder="Ad, kullanıcı adı veya e-posta ara..."
          className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
          leftIcon={<Search className="w-4 h-4" />}
        />
      </form>

      {/* Table */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#CCCCCC] text-center">
          {q ? (
            <>
              <Search className="w-10 h-10 text-[#888888] mb-4" />
              <p className="text-sm font-medium text-[#888888]">&ldquo;{q}&rdquo; için sonuç bulunamadı</p>
            </>
          ) : (
            <>
              <UserX className="w-10 h-10 text-[#888888] mb-4" />
              <p className="text-sm font-medium text-[#888888]">Henüz kullanıcı yok</p>
              <p className="text-xs text-[#888888] mt-1 mb-4">İlk kullanıcıyı oluşturarak başlayın</p>
              <Link href={`${LIST_URL}/yeni`}>
                <FFButton variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Yeni Kullanıcı
                </FFButton>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="ff-shape-container ff-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Header row */}
              <div className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] gap-4 px-6 py-2 bg-[#f5f5f5] border-b border-[#CCCCCC] items-center">
                <span className="text-[10px] font-semibold text-[#888888] w-8" />
                <span className="text-[10px] font-semibold text-[#888888]">Kullanıcı</span>
                <span className="text-[10px] font-semibold text-[#888888]">E-posta</span>
                <span className="text-[10px] font-semibold text-[#888888]">Rol</span>
                <span className="text-[10px] font-semibold text-[#888888] text-center">Aktif</span>
                <span className="text-[10px] font-semibold text-[#888888]">Son Giriş</span>
                <span className="text-[10px] font-semibold text-[#888888] text-right">İşlem</span>
              </div>

              {users.map((user) => {
                const initials = getInitials(user.name, user.email)
                const isSelf = session?.user.id === user.id

                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] gap-4 px-6 py-4
                               border-b border-[#CCCCCC] last:border-b-0 hover:bg-[#F7F7F5] transition-colors duration-100
                               items-center"
                  >
                    <div
                      className="ff-shape-button w-8 h-8 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "#FF4FD8" }}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#333333] truncate">{user.name ?? "—"}</span>
                        {isSelf && <FFBadge variant="purple">Ben</FFBadge>}
                      </div>
                      <span className="text-[11px] font-mono text-[#999999]">@{user.username}</span>
                    </div>

                    <span className="text-xs text-[#333333] truncate">{user.email}</span>

                    <FFBadge variant={getRoleBadgeVariant(user.role.name)}>{user.role.name}</FFBadge>

                    <div className="flex justify-center">
                      {user.isActive ? (
                        <UserCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <UserX className="w-4 h-4 text-red-500" />
                      )}
                    </div>

                    <span className="text-xs text-[#333333] whitespace-nowrap">
                      {user.lastLogin ? formatRelativeTime(user.lastLogin) : "Hiç"}
                    </span>

                    <div className="flex justify-end">
                      <Link href={`${LIST_URL}/${user.username}`}>
                        <FFButton
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit2 className="w-3.5 h-3.5 mr-2" />}
                          className="flex items-center justify-center bg-transparent hover:bg-transparent border-none text-xs text-[#FF4FD8] hover:text-[#dd2bb7] hover:transition-colors duration-200"
                        >
                          Düzenle
                        </FFButton>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
          <span>
            {total} kullanıcıdan {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} gösteriliyor
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`${LIST_URL}?q=${q}&page=${page - 1}`}>
                <FFButton variant="ghost" size="sm">Önceki</FFButton>
              </Link>
            )}
            {page < pages && (
              <Link href={`${LIST_URL}?q=${q}&page=${page + 1}`}>
                <FFButton variant="ghost" size="sm">Sonraki</FFButton>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Drawer (URL-driven) */}
      {drawerMode && (
        <UserDrawer
          mode={drawerMode}
          roles={roles}
          user={drawerUser ?? undefined}
          auditLogs={drawerAudit}
          isSelf={drawerIsSelf}
        />
      )}
    </div>
  )
}
