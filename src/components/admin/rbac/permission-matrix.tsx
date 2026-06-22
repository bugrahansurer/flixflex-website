"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, RotateCcw, Lock, CheckSquare, Square } from "@/lib/icons"
import { FFButton } from "@/components/ui/ff-button"
import { FFBadge } from "@/components/ui/ff-badge"
import { RESOURCE_LIST, ACTION_LIST, PERMISSION_MATRIX, permissionKey } from "@/lib/rbac/permissions"
import { cn } from "@/lib/utils"

interface Permission {
  resource: string
  action: string
  scope?: string | null
}

interface PermissionMatrixProps {
  roleId: string
  initialPermissions: Permission[]
  isLocked?: boolean // Super Admin
}

// Human-readable Turkish labels
const RESOURCE_LABELS: Record<string, string> = {
  blog: "Blog",
  pages: "Sayfalar",
  portfolio: "Portföy",
  themes: "Tema Ayarları",
  roles: "Roller",
  users: "Kullanıcılar",
  settings: "Ayarlar",
  ai: "Yapay Zeka",
  media: "Medya",
}

const ACTION_LABELS: Record<string, string> = {
  read: "Görüntüle",
  create: "Oluştur",
  update: "Düzenle",
  delete: "Sil",
  publish: "Yayınla",
  manage: "Yönet",
}

export function PermissionMatrix({
  roleId,
  initialPermissions,
  isLocked = false,
}: PermissionMatrixProps) {
  // Build initial checked set from props
  const buildSet = React.useCallback((perms: Permission[]) => {
    return new Set(perms.map((p) => permissionKey(p.resource, p.action)))
  }, [])

  const [checked, setChecked] = React.useState<Set<string>>(() => buildSet(initialPermissions))
  const [saved, setSaved] = React.useState<Set<string>>(() => buildSet(initialPermissions))
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const isDirty = React.useMemo(() => {
    if (checked.size !== saved.size) return true
    for (const key of checked) {
      if (!saved.has(key)) return true
    }
    return false
  }, [checked, saved])

  const totalAvailable = React.useMemo(() => {
    return RESOURCE_LIST.reduce((acc, r) => acc + (PERMISSION_MATRIX[r]?.length ?? 0), 0)
  }, [])

  const toggle = (resource: string, action: string) => {
    if (isLocked) return
    const key = permissionKey(resource, action)
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
    setError(null)
  }

  const toggleRow = (resource: string) => {
    if (isLocked) return
    const actions = PERMISSION_MATRIX[resource] ?? []
    const allChecked = actions.every((a) => checked.has(permissionKey(resource, a)))
    setChecked((prev) => {
      const next = new Set(prev)
      if (allChecked) {
        actions.forEach((a) => next.delete(permissionKey(resource, a)))
      } else {
        actions.forEach((a) => next.add(permissionKey(resource, a)))
      }
      return next
    })
    setError(null)
  }

  const toggleCol = (action: string) => {
    if (isLocked) return
    const resources = RESOURCE_LIST.filter((r) => PERMISSION_MATRIX[r]?.includes(action))
    const allChecked = resources.every((r) => checked.has(permissionKey(r, action)))
    setChecked((prev) => {
      const next = new Set(prev)
      if (allChecked) {
        resources.forEach((r) => next.delete(permissionKey(r, action)))
      } else {
        resources.forEach((r) => next.add(permissionKey(r, action)))
      }
      return next
    })
    setError(null)
  }

  const toggleAll = () => {
    if (isLocked) return
    if (checked.size === totalAvailable) {
      setChecked(new Set())
    } else {
      const all = new Set<string>()
      RESOURCE_LIST.forEach((r) => {
        PERMISSION_MATRIX[r]?.forEach((a) => all.add(permissionKey(r, a)))
      })
      setChecked(all)
    }
    setError(null)
  }

  const handleCancel = () => {
    setChecked(new Set(saved))
    setError(null)
  }

  const handleSave = async () => {
    if (!isDirty || isLocked) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const permissions = Array.from(checked).map((key) => {
      const [resource, action] = key.split(":")
      return { resource, action }
    })

    try {
      const res = await fetch(`/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "Kayıt başarısız.")
      }
      setSaved(new Set(checked))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      // Optimistic rollback
      setChecked(new Set(saved))
      setError(err instanceof Error ? err.message : "Bir hata oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const isRowAllChecked = (resource: string) => {
    const actions = PERMISSION_MATRIX[resource] ?? []
    return actions.length > 0 && actions.every((a) => checked.has(permissionKey(resource, a)))
  }

  const isRowPartiallyChecked = (resource: string) => {
    const actions = PERMISSION_MATRIX[resource] ?? []
    return actions.some((a) => checked.has(permissionKey(resource, a))) && !isRowAllChecked(resource)
  }

  const isColAllChecked = (action: string) => {
    const resources = RESOURCE_LIST.filter((r) => PERMISSION_MATRIX[r]?.includes(action))
    return resources.length > 0 && resources.every((r) => checked.has(permissionKey(r, action)))
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="ff-shape-container flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            İzin Matrisi
          </span>
          {isLocked ? (
            <FFBadge variant="warning">
              <Lock className="w-3 h-3" />
              Kilitli
            </FFBadge>
          ) : (
            <FFBadge variant="outline">
              {checked.size} / {totalAvailable} yetki seçili
            </FFBadge>
          )}
        </div>

        {!isLocked && (
          <button
            onClick={toggleAll}
            className="text-[11px] font-semibold text-[var(--ff-purple)] hover:text-[#8B1FE8] transition-colors flex items-center gap-1.5"
          >
            {checked.size === totalAvailable ? (
              <><CheckSquare className="w-4 h-4" /> Hepsini Kaldır</>
            ) : (
              <><Square className="w-4 h-4" /> Hepsini Seç</>
            )}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="text-left px-6 py-3 text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)] border-b border-[var(--border)] w-40">
                Kaynak
              </th>
              {ACTION_LIST.map((action) => (
                <th
                  key={action}
                  className="px-3 py-3 text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--foreground-muted)] border-b border-[var(--border)] text-center"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span>{ACTION_LABELS[action] ?? action}</span>
                    {!isLocked && (
                      <button
                        onClick={() => toggleCol(action)}
                        className={cn(
                          "ff-shape-button w-4 h-4 border transition-colors",
                          isColAllChecked(action)
                            ? "bg-[var(--ff-purple)] border-[var(--ff-purple)]"
                            : "bg-transparent border-[var(--border)] hover:border-[var(--ff-purple)]"
                        )}
                        title={`${ACTION_LABELS[action] ?? action} — tüm kaynaklar`}
                        aria-label={`${action} sütununu seç`}
                      >
                        {isColAllChecked(action) && (
                          <svg viewBox="0 0 10 8" className="w-full h-full p-0.5" fill="none">
                            <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCE_LIST.map((resource) => {
              const rowAll = isRowAllChecked(resource)
              const rowPartial = isRowPartiallyChecked(resource)

              return (
                <tr
                  key={resource}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
                >
                  {/* Row header with "select all" checkbox */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      {!isLocked && (
                        <button
                          onClick={() => toggleRow(resource)}
                          className={cn(
                            "w-4 h-4 border flex-shrink-0 transition-colors relative",
                            rowAll
                              ? "bg-[var(--ff-purple)] border-[var(--ff-purple)]"
                              : rowPartial
                                ? "bg-[var(--ff-purple)/0.2] border-[var(--ff-purple)]"
                                : "bg-transparent border-[var(--border)] hover:border-[var(--ff-purple)]",
                          )}
                          title={`${RESOURCE_LABELS[resource] ?? resource} kaynak izinleri`}
                          aria-label={`${resource} satırını seç`}
                        >
                          {rowAll && (
                            <svg viewBox="0 0 10 8" className="w-full h-full p-0.5" fill="none">
                              <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {rowPartial && !rowAll && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-2 h-0.5 bg-[var(--ff-purple)]" />
                            </span>
                          )}
                        </button>
                      )}
                      <span className="font-medium text-[var(--foreground)] text-xs tracking-wide">
                        {RESOURCE_LABELS[resource] ?? resource}
                      </span>
                    </div>
                  </td>

                  {/* Action cells */}
                  {ACTION_LIST.map((action) => {
                    const available = PERMISSION_MATRIX[resource]?.includes(action) ?? false
                    const key = permissionKey(resource, action)
                    const isChecked = checked.has(key)

                    return (
                      <td key={action} className="px-3 py-3 text-center">
                        {available ? (
                          isLocked ? (
                            isChecked ? (
                              <span className="ff-shape-button inline-flex items-center justify-center w-5 h-5 bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/30">
                                <svg viewBox="0 0 10 8" className="w-3 h-3" fill="none">
                                  <path d="M1 4L4 7L9 1" stroke="var(--ff-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-block w-5 h-5 border border-[var(--border)] opacity-30" />
                            )
                          ) : (
                            <button
                              onClick={() => toggle(resource, action)}
                              className={cn(
                                "ff-shape-button w-4 h-4 border transition-colors",
                                isChecked
                                  ? "bg-[var(--ff-purple)]/10 border-[var(--ff-purple)]/30"
                                  : "bg-transparent border-[var(--border)] hover:border-[var(--ff-purple)]"
                              )}
                              aria-label={`${resource}:${action}`}
                              aria-checked={isChecked}
                              role="checkbox"
                            >
                              {isChecked && (
                                <svg viewBox="0 0 10 8" className="w-full h-full p-0.5" fill="none">
                                  <path d="M1 4L4 7L9 1" stroke="var(--ff-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          )
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-[var(--border)] mx-auto opacity-40" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sticky save bar */}
      <AnimatePresence>
        {isDirty && !isLocked && (
          <motion.div
            className="sticky bottom-0 left-0 right-0 flex items-center justify-between
                       px-6 py-4 bg-[var(--surface)] border-t border-[var(--ff-purple)/40]
                       shadow-[0_-4px_24px_rgba(255, 79, 216,0.12)]"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[var(--ff-purple)] animate-pulse" />
              <span className="text-sm text-[var(--foreground-muted)]">
                Kaydedilmemiş değişiklikler var
              </span>
              {error && (
                <span className="text-xs text-red-500 ml-2">{error}</span>
              )}
              {success && (
                <span className="text-xs text-green-500 ml-2">Kaydedildi</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <FFButton
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleCancel}
                disabled={saving}
              >
                İptal Et
              </FFButton>
              <FFButton
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                loading={saving}
                onClick={handleSave}
              >
                Değişiklikleri Kaydet
              </FFButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
