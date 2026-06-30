import { z } from "zod"

const processStepSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

const sidebarItemSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
})

const resultStatSchema = z.object({
  value: z.number(),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
  label: z.string().min(1),
  description: z.string().optional(),
})

export const portfolioPayloadSchema = z.object({
  title: z.string().min(2).max(180),
  slug: z.string().min(1).max(220),
  client: z.string().min(1).max(180),
  clientLogo: z.string().nullable().optional(),
  category: z.string().min(1).max(80),
  description: z.string().min(5).max(800),
  content: z.string().optional(),
  coverImage: z.string().min(1),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  year: z.number().int().min(1990).max(2100),
  gradient: z.string().min(1),
  accentColor: z.string().min(4).max(20),
  tall: z.boolean().default(false),
  narrativeParagraphs: z.array(z.string().min(1)).default([]),
  sidebarItems: z.array(sidebarItemSchema).default([]),
  resultStats: z.array(resultStatSchema).default([]),
  serviceIds: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  order: z.number().int().default(0),
})

export const servicePayloadSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(1).max(220),
  description: z.string().min(5).max(600),
  body: z.string().min(10),
  icon: z.string().min(1).default("Globe"),
  features: z.array(z.string().min(1)).default([]),
  processSteps: z.array(processStepSchema).default([]),
  deliverables: z.array(z.string().min(1)).default([]),
  isPublished: z.boolean().default(false),
  order: z.number().int().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  parentId: z.string().optional().nullable(),
  coverImage: z.string().nullable().optional(),
  accentColor: z.string().nullable().optional(),
  gradient: z.string().nullable().optional(),
  motionDesign: z.string().nullable().optional(),
})
