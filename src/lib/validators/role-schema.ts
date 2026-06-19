// ═══════════════════════════════════════════════════════════
// FlixFlex — Role Zod Schemas
// ═══════════════════════════════════════════════════════════

import { z } from "zod"

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Rol adı en az 2 karakter olmalı")
    .max(64, "Rol adı en fazla 64 karakter olabilir")
    .trim(),
  description: z
    .string()
    .max(256, "Açıklama en fazla 256 karakter olabilir")
    .optional()
    .nullable(),
})

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Rol adı en az 2 karakter olmalı")
    .max(64, "Rol adı en fazla 64 karakter olabilir")
    .trim()
    .optional(),
  description: z
    .string()
    .max(256, "Açıklama en fazla 256 karakter olabilir")
    .optional()
    .nullable(),
})

export type CreateRoleData = z.infer<typeof createRoleSchema>
export type UpdateRoleData = z.infer<typeof updateRoleSchema>
