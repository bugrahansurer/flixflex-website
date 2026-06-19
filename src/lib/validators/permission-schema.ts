// ═══════════════════════════════════════════════════════════
// FlixFlex — Permission Zod Schemas
// ═══════════════════════════════════════════════════════════

import { z } from "zod"
import { RESOURCE_LIST, ACTION_LIST } from "@/lib/rbac/permissions"

const permissionItemSchema = z.object({
  resource: z.string().min(1, "Kaynak adı boş olamaz"),
  action:   z.string().min(1, "İşlem adı boş olamaz"),
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
