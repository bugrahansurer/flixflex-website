// ═══════════════════════════════════════════════════════════
// FlixFlex — Page (Page Builder) Zod Schemas
//
// Used by /api/pages and /api/pages/[id] to validate
// untrusted JSON payloads before they reach Prisma.
// ═══════════════════════════════════════════════════════════

import { z } from "zod"

export const sectionBlockSchema = z.object({
  id:          z.string(),
  type:        z.string(),
  props:       z.record(z.string(), z.unknown()),
  order:       z.number(),
  visible:     z.boolean().optional().default(true),
  transition:  z.enum(["normal", "sticky", "parallax", "overlap", "story-scroll"]).optional(),
  stickyPin:   z.boolean().optional(),
})

export const createPageSchema = z.object({
  title:       z.string().min(1).max(200),
  // Allow lowercase alphanumerics, hyphen and forward slash for nested paths.
  slug:        z.string().regex(/^[a-z0-9-/]+$/).max(100),
  description: z.string().max(500).optional(),
})

export const updatePageSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  slug:        z.string().regex(/^[a-z0-9-/]+$/).max(100).optional(),
  description: z.string().max(500).optional(),
  sections:    z.array(sectionBlockSchema).optional(),
  status:      z.enum(["draft", "published"]).optional(),
})

export type CreatePageData = z.infer<typeof createPageSchema>
export type UpdatePageData = z.infer<typeof updatePageSchema>
