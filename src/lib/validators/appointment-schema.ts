// ═══════════════════════════════════════════════════════════
// FlixFlex — Appointment Form Zod Schema
// Shared between client (react-hook-form) and API route
// ═══════════════════════════════════════════════════════════

import { z } from "zod"

export const APPOINTMENT_SUBJECTS = [
  "Hizmet Satın Alımı",
  "Teknik Destek",
  "İş Ortaklığı",
  "Diğer",
] as const

export const appointmentSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı")
    .max(100, "İsim en fazla 100 karakter olabilir"),

  email: z
    .string()
    .email("Geçerli bir e-posta adresi girin"),

  phone: z
    .string()
    .min(10, "Telefon numarası en az 10 karakter olmalı")
    .max(20, "Telefon numarası en fazla 20 karakter olabilir"),

  subject: z
    .enum(APPOINTMENT_SUBJECTS, {
      error: "Lütfen geçerli bir konu seçin",
    }),

  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Geçerli bir tarih ve saat seçin",
    }),

  notes: z
    .string()
    .max(1000, "Talep açıklaması en fazla 1000 karakter olabilir")
    .optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>
