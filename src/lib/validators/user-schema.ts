// ═══════════════════════════════════════════════════════════
// FlixFlex — User Zod Schemas
// ═══════════════════════════════════════════════════════════

import { z } from "zod"
import { USERNAME_REGEX } from "@/lib/username"

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(128, "Ad en fazla 128 karakter olabilir")
    .trim(),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi girin")
    .toLowerCase(),
  username: z
    .string()
    .regex(USERNAME_REGEX, "Kullanıcı adı 3-30 karakter; küçük harf, rakam, . _ - olabilir")
    .optional(),
  roleId: z
    .string()
    .min(1, "Bir rol seçmelisiniz"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(128, "Şifre en fazla 128 karakter olabilir"),
  sendInviteEmail: z.boolean().optional().default(false),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(128, "Ad en fazla 128 karakter olabilir")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi girin")
    .toLowerCase()
    .optional(),
  username: z
    .string()
    .regex(USERNAME_REGEX, "Kullanıcı adı 3-30 karakter; küçük harf, rakam, . _ - olabilir")
    .optional(),
  roleId: z.string().min(1, "Bir rol seçmelisiniz").optional(),
  isActive: z.boolean().optional(),
})

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(128, "Şifre en fazla 128 karakter olabilir"),
})

export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type SetPasswordData = z.infer<typeof setPasswordSchema>
