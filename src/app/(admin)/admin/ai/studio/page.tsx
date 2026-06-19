// ═══════════════════════════════════════════════════════════
// /admin/ai/studio — AI Studio (multi-step wizard shell)
// Server Component → renders client wizard
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "@/lib/icons"
import { AIStudio } from "@/components/admin/ai/ai-studio"
import { hasEnv } from "@/lib/env"
import { getSetting } from "@/lib/settings"

export const metadata: Metadata = {
  title: "AI Studio — Yeni Blog Üret",
}

export default async function AIStudioPage() {
  // Check for any AI key (Env or DB)
  const anthropicKey = (await getSetting("ai.provider.anthropic.key")) || (hasEnv("ANTHROPIC_API_KEY") ? "exists" : null)
  const openaiKey = (await getSetting("ai.provider.openai.key")) || (hasEnv("OPENAI_API_KEY") ? "exists" : null)
  const geminiKey = (await getSetting("ai.provider.gemini.key")) || (hasEnv("GOOGLE_AI_KEY") ? "exists" : null)

  const keyConfigured = !!(anthropicKey || openaiKey || geminiKey)
  const defaultModel = (await getSetting("ai.default.model", "claude-3-5-sonnet-20240620")) ?? "claude-3-5-sonnet-20240620"

  return (
    <div className="min-h-screen">
      {/* Sub-header */}
      <div className="px-6 md:px-10 pt-6 pb-2">
        <Link
          href="/admin/ai"
          className="ff-shape-button items-center gap-1.5 text-[12px] font-medium text-[var(--foreground-muted)] hover:text-[var(--ff-purple)] transition-colors"
        >
          <ArrowLeft size={13} />
          AI Asistan
        </Link>
      </div>

      <AIStudio keyConfigured={keyConfigured} defaultModel={defaultModel} />
    </div>
  )
}
