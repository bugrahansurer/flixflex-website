// ═══════════════════════════════════════════════════════════
// FlixFlex — Prisma-backed blog store
//
// All admin blog endpoints + AI studio go through this module.
// Field mapping (Prisma model → BlogPostRecord):
//   • coverImage   (string)  ↔ coverGradient
//   • readTime     (number)  ↔ readMinutes
//   • author       (string)  ↔ JSON-encoded {name, role, initials}
//   • tags         (string[])
//
// Public BlogPost shape (used by the public site) is derived
// via `toPublicPost()` to stay backwards-compatible with the
// existing `@/components/public/blog/blog-data` consumers.
// ═══════════════════════════════════════════════════════════

import prisma from "@/lib/prisma"
import type { BlogPost } from "@/components/public/blog/blog-data"
import { slugify, readingTime } from "@/lib/utils"

const DEFAULT_AUTHOR = {
  name: "FlixFlex AI",
  role: "AI Content Engine",
  initials: "AI",
}

const DEFAULT_GRADIENT = "from-[var(--ff-purple)]/30 via-[var(--ff-purple-dark)]/20 to-[var(--ff-dark)]"

export interface BlogPostRecord {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  coverGradient: string
  template: "classic" | "editorial" | "visual"
  category: string
  tags: string[]
  author: { name: string; role: string; initials: string }
  readMinutes: number
  publishedAt: string
  status: "draft" | "published"
  aiGenerated: boolean
  aiOutline?: unknown
  createdAt: string
  updatedAt: string
  featured?: boolean
}

// ── Prisma row type (locally inferred or mock) ─────────────
type PrismaBlogRow = any

// ── Author serialization helpers ───────────────────────────
function parseAuthor(raw: string | null): BlogPostRecord["author"] {
  if (!raw) return DEFAULT_AUTHOR
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && "name" in parsed) {
      return {
        name: String(parsed.name ?? DEFAULT_AUTHOR.name),
        role: String(parsed.role ?? DEFAULT_AUTHOR.role),
        initials: String(parsed.initials ?? DEFAULT_AUTHOR.initials),
      }
    }
  } catch {
    // Legacy plain-string author — treat as name
    return { ...DEFAULT_AUTHOR, name: raw, initials: raw.slice(0, 2).toUpperCase() }
  }
  return DEFAULT_AUTHOR
}

function stringifyAuthor(a: BlogPostRecord["author"]): string {
  return JSON.stringify(a)
}

// ── Row → record mapping ───────────────────────────────────
function toRecord(row: NonNullable<PrismaBlogRow>): BlogPostRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content,
    coverImage: row.coverImage ?? null,
    coverGradient: row.coverGradient ?? DEFAULT_GRADIENT,
    template: (row.template as BlogPostRecord["template"]) ?? "classic",
    category: row.category ?? "Strateji",
    tags: row.tags ?? [],
    author: parseAuthor(row.author),
    readMinutes: row.readTime ?? 5,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    status: (row.status as BlogPostRecord["status"]) ?? "draft",
    aiGenerated: row.aiGenerated,
    aiOutline: row.aiOutline ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

// ── CRUD ───────────────────────────────────────────────────
export async function listPosts(filter?: {
  status?: "draft" | "published"
  category?: string
  aiGenerated?: boolean
}): Promise<BlogPostRecord[]> {
  if (!prisma) return []

  try {
    const rows = await prisma.blogPost.findMany({
      where: {
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.category ? { category: filter.category } : {}),
        ...(typeof filter?.aiGenerated === "boolean"
          ? { aiGenerated: filter.aiGenerated }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
    })
    return rows.map(toRecord)
  } catch (err) {
    console.error("[blog-store listPosts] Prisma query failed:", err)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPostRecord | null> {
  if (!prisma) return null
  try {
    const row = await prisma.blogPost.findUnique({ where: { slug } })
    return row ? toRecord(row) : null
  } catch {
    return null
  }
}

export async function getPostById(id: string): Promise<BlogPostRecord | null> {
  if (!prisma) return null
  try {
    const row = await prisma.blogPost.findUnique({ where: { id } })
    return row ? toRecord(row) : null
  } catch {
    return null
  }
}

export interface CreatePostInput {
  title: string
  slug?: string
  excerpt?: string
  content: string
  coverImage?: string | null
  coverGradient?: string
  template?: "classic" | "editorial" | "visual"
  category?: string
  tags?: string[]
  author?: BlogPostRecord["author"]
  status?: "draft" | "published"
  aiGenerated?: boolean
  aiOutline?: unknown
}

export async function createPost(input: CreatePostInput): Promise<BlogPostRecord> {
  const slug = input.slug?.trim() || slugify(input.title)
  const status = input.status ?? "draft"

  if (!prisma) {
    // Return a mock record for UI stability in dev-without-db
    return {
      id: "mock-id",
      title: input.title,
      slug,
      excerpt: input.excerpt ?? deriveExcerpt(input.content),
      content: input.content,
      coverImage: input.coverImage ?? null,
      coverGradient: input.coverGradient ?? DEFAULT_GRADIENT,
      template: input.template ?? "classic",
      category: input.category ?? "Strateji",
      tags: input.tags ?? [],
      author: input.author ?? DEFAULT_AUTHOR,
      readMinutes: readingTime(input.content),
      publishedAt: new Date().toISOString(),
      status: status as any,
      aiGenerated: input.aiGenerated ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const row = await prisma.blogPost.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt ?? deriveExcerpt(input.content),
      content: input.content,
      coverImage: input.coverImage ?? null,
      coverGradient: input.coverGradient ?? DEFAULT_GRADIENT,
      template: input.template ?? "classic",
      category: input.category ?? "Strateji",
      tags: input.tags ?? [],
      author: stringifyAuthor(input.author ?? DEFAULT_AUTHOR),
      readTime: readingTime(input.content),
      aiGenerated: input.aiGenerated ?? false,
      aiOutline: (input.aiOutline as import("@prisma/client").Prisma.InputJsonValue) ?? undefined,
      status,
      publishedAt: status === "published" ? new Date() : null,
    },
  })
  return toRecord(row)
}

export async function updatePost(
  idOrSlug: string,
  patch: Partial<CreatePostInput>
): Promise<BlogPostRecord | null> {
  if (!prisma) return null

  try {
    // Locate row first (accept id or slug)
    const existing =
      (await prisma.blogPost.findUnique({ where: { id: idOrSlug } })) ??
      (await prisma.blogPost.findUnique({ where: { slug: idOrSlug } }))
    if (!existing) return null

    const wasPublished = existing.status === "published"
    const willBePublished = patch.status === "published"

    const row = await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
        ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
        ...(patch.content !== undefined ? {
          content: patch.content,
          readTime: readingTime(patch.content),
        } : {}),
        ...(patch.coverImage !== undefined ? { coverImage: patch.coverImage } : {}),
        ...(patch.coverGradient !== undefined ? { coverGradient: patch.coverGradient } : {}),
        ...(patch.template !== undefined ? { template: patch.template } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.author !== undefined ? { author: stringifyAuthor(patch.author) } : {}),
        ...(patch.aiGenerated !== undefined ? { aiGenerated: patch.aiGenerated } : {}),
        ...(patch.aiOutline !== undefined ? {
          aiOutline: patch.aiOutline as import("@prisma/client").Prisma.InputJsonValue,
        } : {}),
        ...(patch.status !== undefined ? {
          status: patch.status,
          // Stamp publishedAt on first publish; keep it on republish
          publishedAt:
            willBePublished && !wasPublished
              ? new Date()
              : willBePublished
                ? existing.publishedAt ?? new Date()
                : existing.publishedAt,
        } : {}),
      },
    })
    return toRecord(row)
  } catch {
    return null
  }
}

export async function deletePost(idOrSlug: string): Promise<boolean> {
  if (!prisma) return false
  try {
    const existing =
      (await prisma.blogPost.findUnique({ where: { id: idOrSlug } })) ??
      (await prisma.blogPost.findUnique({ where: { slug: idOrSlug } }))
    if (!existing) return false
    await prisma.blogPost.delete({ where: { id: existing.id } })
    return true
  } catch {
    return false
  }
}

// ── Helpers ────────────────────────────────────────────────
function deriveExcerpt(content: string): string {
  return content
    .slice(0, 200)
    .replace(/[#*>\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160)
}

// ── Compatibility view: map record → BlogPost (public shape) ─
export function toPublicPost(record: BlogPostRecord): BlogPost {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    content: record.content,
    coverImage: record.coverImage,
    coverGradient: record.coverGradient,
    template: record.template,
    category: record.category,
    tags: record.tags,
    author: record.author,
    readMinutes: record.readMinutes,
    publishedAt: record.publishedAt,
    featured: record.featured,
  }
}
