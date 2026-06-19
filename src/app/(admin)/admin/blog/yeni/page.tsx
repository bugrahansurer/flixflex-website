// ═══════════════════════════════════════════════════════════
// /admin/blog/yeni — Manual blog editor
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "@/lib/icons"
import { BlogEditor } from "@/components/admin/blog/blog-editor"

export const metadata: Metadata = {
  title: "Yeni Yazı",
}

export default function NewBlogPage() {
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
      <BlogEditor mode="new" />
    </div>
  )
}
