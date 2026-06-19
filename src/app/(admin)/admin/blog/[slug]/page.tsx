// ═══════════════════════════════════════════════════════════
// /admin/blog/[slug] — Edit existing blog post
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "@/lib/icons"
import { getPostBySlug } from "@/lib/ai/blog-store"
import { BlogEditor } from "@/components/admin/blog/blog-editor"

export const metadata: Metadata = {
  title: "Yazıyı Düzenle",
}

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen">
      <div className="px-6 md:px-10 pt-6 pb-2">
        <Link
          href="/admin/blog"
          className="ff-shape-button inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--foreground-muted)] hover:text-[var(--ff-purple)] transition-colors"
        >
          <ArrowLeft size={13} />
          Blog &amp; İçerik
        </Link>
      </div>
      <BlogEditor mode="edit" initial={post} />
    </div>
  )
}
