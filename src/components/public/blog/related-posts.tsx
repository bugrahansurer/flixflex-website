import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { BlogCard } from "./blog-card"
import type { BlogPost } from "./blog-data"

interface RelatedPostsProps {
  posts: BlogPost[]
  className?: string
}

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className={cn("", className)}>
      <div className="flex items-center gap-4 mb-8">
        <Eyebrow>İlgili Yazılar</Eyebrow>
        <span className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <BlogCard className="p-4" key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}
