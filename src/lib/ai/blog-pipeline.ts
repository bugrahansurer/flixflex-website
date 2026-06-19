// ═══════════════════════════════════════════════════════════
// FlixFlex — AI Blog Pipeline Orchestrator
//
// Each stage is a thin async function. Together they form a
// linear pipeline (topic → titles → outline → article →
// images → template) but every stage can be called in
// isolation so the studio UI can rerun any step independently.
//
// Now updated to be provider-agnostic via the AI engine.
// ═══════════════════════════════════════════════════════════

import { runAI, streamAI, type AIResponse } from "@/lib/ai"
import {
  TITLE_SUGGESTION_SYSTEM,
  TITLE_SUGGESTION_USER,
  RESEARCH_OUTLINE_SYSTEM,
  RESEARCH_OUTLINE_USER,
  ARTICLE_WRITING_SYSTEM,
  ARTICLE_WRITING_USER,
  IMAGE_DESCRIPTION_SYSTEM,
  IMAGE_DESCRIPTION_USER,
  TEMPLATE_SUGGESTION_SYSTEM,
  TEMPLATE_SUGGESTION_USER,
} from "@/lib/ai/prompts"
import { generateImagePlaceholder } from "@/lib/ai/image-stub"

// ── Public types ──────────────────────────────────────────
export interface OutlineSection {
  heading: string
  points:  string[]
}

export interface Outline {
  outline:      OutlineSection[]
  keyArguments: string[]
  sources:      Array<{ title: string; url: string }>
}

export interface ImageSuggestion {
  caption:     string
  prompt:      string
  placement:   string
  placeholder: string
}

export type TemplateName = "classic" | "editorial" | "visual"

// ── JSON parsing helpers ───────────────────────────────────
function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(stripFences(text)) as T
  } catch {
    return null
  }
}

/**
 * Generic helper: run an AI prompt, parse JSON, retry once
 * with a sterner reminder if the first response is malformed.
 */
async function jsonAI<T>(input: {
  system:      string
  user:        string
  maxTokens?:  number
  temperature?: number
  model?:       string
}): Promise<{ data: T; raw: AIResponse }> {
  const first = await runAI({
    system:      input.system,
    messages:    [{ role: "user", content: input.user }],
    maxTokens:   input.maxTokens   ?? 2048,
    temperature: input.temperature ?? 0.6,
    model:       input.model,
  })
  const parsed = tryParseJson<T>(first.text)
  if (parsed !== null) return { data: parsed, raw: first }

  // Retry once with explicit JSON-only reminder
  const retry = await runAI({
    system:      input.system,
    messages: [
      { role: "user",      content: input.user },
      { role: "assistant", content: first.text },
      {
        role:    "user",
        content:
          "Çıktın geçerli JSON olarak ayrıştırılamadı. Lütfen SADECE istenen "
          + "JSON şemasında, kod bloğu işareti olmadan tekrar gönder.",
      },
    ],
    maxTokens:   input.maxTokens   ?? 2048,
    temperature: 0.2,
    model:       input.model,
  })
  const reparsed = tryParseJson<T>(retry.text)
  if (reparsed !== null) return { data: reparsed, raw: retry }

  throw new Error(
    `AI yanıtı JSON olarak ayrıştırılamadı (2 deneme sonra): ${first.text.slice(0, 200)}`
  )
}

// ═══════════════════════════════════════════════════════════
// STAGE 1 — Title Suggestions
// ═══════════════════════════════════════════════════════════
export async function suggestTitles(topic: string, model?: string): Promise<string[]> {
  const t = topic.trim()
  if (!t) throw new Error("Konu boş olamaz.")

  const { data } = await jsonAI<string[]>({
    system: TITLE_SUGGESTION_SYSTEM,
    user:   TITLE_SUGGESTION_USER(t),
    maxTokens: 1024,
    temperature: 0.85,
    model,
  })
  if (!Array.isArray(data)) {
    throw new Error("Başlık önerileri beklenen formatta gelmedi.")
  }
  return data.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
}

// ═══════════════════════════════════════════════════════════
// STAGE 2 — Research + Outline
// ═══════════════════════════════════════════════════════════
export async function generateOutline(title: string, model?: string): Promise<Outline> {
  const t = title.trim()
  if (!t) throw new Error("Başlık boş olamaz.")

  const { data } = await jsonAI<Partial<Outline>>({
    system: RESEARCH_OUTLINE_SYSTEM,
    user:   RESEARCH_OUTLINE_USER(t),
    maxTokens: 2048,
    temperature: 0.55,
    model,
  })

  return {
    outline:      Array.isArray(data.outline) ? data.outline : [],
    keyArguments: Array.isArray(data.keyArguments) ? data.keyArguments : [],
    sources:      Array.isArray(data.sources) ? data.sources : [],
  }
}

// ═══════════════════════════════════════════════════════════
// STAGE 3 — Full Article
// ═══════════════════════════════════════════════════════════
export async function writeArticle(input: {
  title:   string
  outline: Outline
  model?:  string
}): Promise<string> {
  const result = await runAI({
    system:      ARTICLE_WRITING_SYSTEM,
    messages: [
      { role: "user", content: ARTICLE_WRITING_USER(input) },
    ],
    maxTokens:   8192,
    temperature: 0.75,
    model:       input.model,
  })
  return result.text
}

export async function* writeArticleStream(input: {
  title:   string
  outline: Outline
  model?:  string
}) {
  const stream = streamAI({
    system:      ARTICLE_WRITING_SYSTEM,
    messages: [
      { role: "user", content: ARTICLE_WRITING_USER(input) },
    ],
    maxTokens:   8192,
    temperature: 0.75,
    model:       input.model,
  })

  for await (const chunk of stream) {
    yield chunk
  }
}

// ═══════════════════════════════════════════════════════════
// STAGE 4 — Image Suggestions (with deterministic stub URLs)
// ═══════════════════════════════════════════════════════════
export async function suggestImages(article: string, model?: string): Promise<ImageSuggestion[]> {
  type RawImage = { caption?: string; prompt?: string; placement?: string }
  const { data } = await jsonAI<RawImage[]>({
    system: IMAGE_DESCRIPTION_SYSTEM,
    user:   IMAGE_DESCRIPTION_USER(article),
    maxTokens: 1024,
    temperature: 0.6,
    model,
  })

  if (!Array.isArray(data)) return []

  return data
    .filter((d): d is Required<RawImage> =>
      typeof d?.caption === "string"
      && typeof d?.prompt === "string"
      && typeof d?.placement === "string"
    )
    .map((d) => ({
      caption:     d.caption,
      prompt:      d.prompt,
      placement:   d.placement,
      placeholder: generateImagePlaceholder(d.prompt),
    }))
}

// ═══════════════════════════════════════════════════════════
// STAGE 5 — Template Suggestion
// ═══════════════════════════════════════════════════════════
const TEMPLATE_VALUES: ReadonlySet<TemplateName> = new Set([
  "classic",
  "editorial",
  "visual",
])

export async function suggestTemplate(article: string, model?: string): Promise<TemplateName> {
  const { data } = await jsonAI<{ template?: string }>({
    system: TEMPLATE_SUGGESTION_SYSTEM,
    user:   TEMPLATE_SUGGESTION_USER(article),
    maxTokens: 128,
    temperature: 0.3,
    model,
  })

  const candidate = (data.template ?? "").toLowerCase() as TemplateName
  return TEMPLATE_VALUES.has(candidate) ? candidate : "classic"
}
