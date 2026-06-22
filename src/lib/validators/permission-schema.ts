// ═══════════════════════════════════════════════════════════
// FlixFlex — Permission Zod Schemas
// ═══════════════════════════════════════════════════════════

import { z } from "zod"
import { RESOURCE_LIST, ACTION_LIST } from "@/lib/rbac/permissions"

// Kaynak/işlem değerlerini kanonik RBAC listelerine göre whitelist'le; böylece
// API hiçbir zaman tanımsız bir kaynağı veya tehlikeli "*" joker'ini yazamaz
// (hasPermission() "*"'ı tam yetki olarak yorumladığından bu bir privesc yüzeyi).
const permissionItemSchema = z.object({
  resource: z.string().refine((v) => RESOURCE_LIST.includes(v), "Geçersiz kaynak adı"),
  action:   z.string().refine((v) => ACTION_LIST.includes(v), "Geçersiz işlem adı"),
  scope:    z.string().nullable().optional(),
})

// PUT /api/roles/{id}/permissions — replace all permissions atomically
export const replacePermissionsSchema = z.object({
  permissions: z
    .array(permissionItemSchema)
    .max(
      RESOURCE_LIST.length * ACTION_LIST.length,
      "İzin sayısı mümkün olan maksimumu aşıyor"
    ),
})

export type PermissionItem = z.infer<typeof permissionItemSchema>
export type ReplacePermissionsData = z.infer<typeof replacePermissionsSchema>
