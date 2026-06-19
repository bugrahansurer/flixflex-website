// ═══════════════════════════════════════════════════════════
// FlixFlex — Contact Form Zod Schema
// Shared between client (react-hook-form) and API route
// ═══════════════════════════════════════════════════════════

import { z } from "zod"

export const SERVICE_SLUGS = [
  "performans-pazarlamasi",
  "yaratici-yonetim",
  "sosyal-medya-yonetimi",
  "marka-kimligi",
  "icerik-uretimi",
  "web-ve-dijital",
  "diger",
] as const

export const BUDGET_OPTIONS = [
  "Belirsiz",
  "5-15K",
  "15-50K",
  "50-150K",
  "150K+",
] as const

export const SERVICE_LABELS: Record<(typeof SERVICE_SLUGS)[number], string> = {
  "performans-pazarlamasi": "Performance Marketing",
  "yaratici-yonetim":       "Creative Direction",
  "sosyal-medya-yonetimi":  "Social Media Management",
  "marka-kimligi":          "Brand Identity",
  "icerik-uretimi":         "Content Production",
  "web-ve-dijital":         "Web & Digital",
  "diger":                  "Diğer",
}

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı"),

  email: z
    .string()
    .email("Geçerli bir e-posta girin"),

  company: z
    .string()
    .optional(),

  phone: z
    .string()
    .optional(),

  service: z.enum(SERVICE_SLUGS, {
    error: "Lütfen bir hizmet seçin",
  }),

  budget: z
    .enum([...BUDGET_OPTIONS, ""])
    .optional(),

  message: z
    .string()
    .min(20, "Mesaj en az 20 karakter olmalı")
    .max(2000, "Mesaj en fazla 2000 karakter olabilir"),

  consent: z.literal(true, {
    error: "Devam etmek için KVKK metnini onaylamanız gerekir",
  }),
})

export type ContactFormData = z.infer<typeof contactSchema>
