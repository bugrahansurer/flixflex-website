import { z } from "zod"

// ── Profil bilgileri (name + email + image) ──────────
// SECURITY: image URL must be HTTPS — blocks javascript:, data:,
// http: and other non-TLS schemes that could be rendered as a
// profile picture <img src=...>.
export const updateProfileSchema = z.object({
  name:  z.string().trim().min(2, "İsim en az 2 karakter olmalı").max(100),
  email: z.string().email("Geçerli bir e-posta girin").toLowerCase(),
  image: z
    .string()
    .url("Geçerli bir URL girin")
    .refine((v) => v.startsWith("https://"), {
      message: "Görsel URL'si HTTPS olmalı",
    })
    .nullable()
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ── Şifre değiştirme (mevcut + yeni + tekrar) ────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gerekli"),
    newPassword:     z
      .string()
      .min(8,  "Yeni şifre en az 8 karakter olmalı")
      .max(72, "Şifre 72 karakteri aşmamalı"),
    confirmPassword: z.string().min(1, "Şifre tekrarı gerekli"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path:    ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "Yeni şifre eskisinden farklı olmalı",
    path:    ["newPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
