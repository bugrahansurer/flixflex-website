"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — UserDrawer
// Sağdan açılan geniş kullanıcı drawer'ı (Radix Dialog).
// URL tarafından kontrol edilir: /admin/kullanicilar/<username> → edit,
// /admin/kullanicilar/yeni → new. Kapanınca listeye döner.
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useRouter } from "next/navigation"
import { X, Activity, Clock } from "@/lib/icons"
import { FFContainer } from "@/components/ui/ff-container"
import { FFBadge } from "@/components/ui/ff-badge"
import { UserForm } from "./user-form"
import { ChangePasswordForm } from "./change-password-form"
import { DeleteUserButton } from "./delete-user-button"
import { formatDate, formatRelativeTime } from "@/lib/utils"

interface Role {
  id: string
  name: string
}

interface DrawerUser {
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

interface AuditEntry {
  id: string
  action: string
  createdAt: Date
}

interface UserDrawerProps {
  mode: "edit" | "new"
  roles: Role[]
  user?: DrawerUser
  auditLogs?: AuditEntry[]
  isSelf?: boolean
}

const LIST_URL = "/admin/kullanicilar"

function getInitials(name: string | null, email: string): string {
  const src = name?.trim() || email
  const parts = src.split(/\s+/)
  if (parts.length === 1) return (parts[0][0] + (parts[0][1] ?? "")).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserDrawer({ mode, roles, user, auditLogs = [], isSelf = false }: UserDrawerProps) {
  const router = useRouter()
  const close = React.useCallback(() => router.push(LIST_URL), [router])

  return (
    <Dialog.Root open onOpenChange={(o) => { if (!o) close() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] max-w-full bg-[#F7F7F5] border-l border-[#CCCCCC] shadow-2xl flex flex-col outline-none animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E0E0E0] flex-shrink-0">
            <Dialog.Title className="font-display text-lg font-bold text-[#333333] truncate">
              {mode === "new" ? "Yeni Kullanıcı" : (user?.name ?? user?.email ?? "Kullanıcı")}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Kapat"
              className="ff-shape-button w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#333333] hover:bg-black/5 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {mode === "new" ? (
              <>
                <Dialog.Description className="text-xs text-[#888888]">
                  Yeni bir yönetici hesabı oluşturun.
                </Dialog.Description>
                <UserForm roles={roles} />
              </>
            ) : user ? (
              <>
                <Dialog.Description className="sr-only">
                  {user.name ?? user.email} kullanıcısının ayarları
                </Dialog.Description>

                {/* Identity */}
                <div className="flex items-center gap-3">
                  <div
                    className="ff-shape-button w-11 h-11 flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "#FF4FD8" }}
                  >
                    {getInitials(user.name, user.email)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isSelf && <FFBadge variant="purple">Siz</FFBadge>}
                      <FFBadge variant="outline">{user.role.name}</FFBadge>
                      <FFBadge variant={user.isActive ? "success" : "error"}>
                        {user.isActive ? "Aktif" : "Pasif"}
                      </FFBadge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#888888]">
                      <span className="font-mono text-[#FF4FD8]">@{user.username}</span>
                      <span aria-hidden>·</span>
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Edit form */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#888888]">Bilgileri Düzenle</h3>
                  <FFContainer className="ff-card" border="subtle" padding="lg">
                    <UserForm
                      roles={roles}
                      initial={{
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        roleId: user.roleId,
                        isActive: user.isActive,
                      }}
                    />
                  </FFContainer>
                </section>

                {/* Password */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#888888]">Şifre Değiştir</h3>
                  <FFContainer className="ff-card" border="subtle" padding="lg">
                    <ChangePasswordForm userId={user.id} />
                  </FFContainer>
                </section>

                {/* Meta */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#888888]">Hesap Bilgileri</h3>
                  <FFContainer className="ff-card" border="subtle" padding="md">
                    <dl className="grid grid-cols-2 gap-3">
                      <div>
                        <dt className="text-[10px] font-semibold text-[#888888]">Son Giriş</dt>
                        <dd className="mt-1 text-xs text-[#888888]">
                          {user.lastLogin ? (
                            <span title={formatDate(user.lastLogin)}>{formatRelativeTime(user.lastLogin)}</span>
                          ) : "Hiç giriş yapmadı"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-semibold text-[#888888]">Kayıt Tarihi</dt>
                        <dd className="mt-1 text-xs text-[#888888]">{formatDate(user.createdAt)}</dd>
                      </div>
                    </dl>
                  </FFContainer>
                </section>

                {/* Audit */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#888888] flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    Son Aktiviteler
                  </h3>
                  <FFContainer className="ff-card" border="subtle" padding="none">
                    {auditLogs.length === 0 ? (
                      <div className="px-5 py-6 text-center">
                        <Clock className="w-5 h-5 text-[#888888] mx-auto mb-2" />
                        <p className="text-xs text-[#888888]">Aktivite kaydı bulunamadı</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-[var(--border)]">
                        {auditLogs.map((log) => (
                          <li key={log.id} className="px-5 py-3 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4FD8] mt-1.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#888888] truncate">{log.action}</p>
                              <p className="text-[10px] text-[#888888] mt-0.5">{formatRelativeTime(log.createdAt)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </FFContainer>
                </section>

                {/* Delete */}
                <div className="pt-2 border-t border-[#E0E0E0]">
                  <DeleteUserButton userId={user.id} userName={user.name ?? user.email} isSelf={isSelf} />
                </div>
              </>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
