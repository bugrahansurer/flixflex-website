// ═══════════════════════════════════════════════════════════
// /admin/blog — Blog & İçerik Yönetimi
// Server Component shell → renders client list
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import { listPosts } from "@/lib/ai/blog-store"
import { BlogList } from "@/components/admin/blog/blog-list"

export const metadata: Metadata = {
  title: "Blog & İçerik",
}

export default async function BlogIndexPage() {
  const posts = await listPosts()
  return <BlogList initialPosts={posts} />
}
