// ═══════════════════════════════════════════════════════════
// FlixFlex — Anthropic SDK Wrapper
//
// Singleton client + thin `runClaude` helper used by every
// stage of the blog pipeline. Centralising this keeps:
//   • API-key plumbing in one place (env-driven, never inlined)
//   • Default model upgrades trivial — swap the const, done
//   • Token usage logging consistent across stages
//
// If `ANTHROPIC_API_KEY` is missing we throw lazily at call
// time so the rest of the admin UI keeps booting (the dash
// shows a "key missing" warning instead of crashing).
// ═══════════════════════════════════════════════════════════

import Anthropic from "@anthropic-ai/sdk"
import { env, hasEnv } from "@/lib/env"
import { getSetting } from "@/lib/settings"
import { decryptSecret } from "@/lib/crypto"

// ── Default model (kept up to date with project context) ──
export const DEFAULT_MODEL = "claude-3-5-sonnet-20240620"
export const FAST_MODEL    = "claude-3-haiku-20240307"

// ── Singleton ──────────────────────────────────────────────
let _client: Anthropic | null = null

export async function getAnthropic(): Promise<Anthropic> {
  if (_client) return _client

  // Priority: Database Settings -> Environment Variables
  const dbKey = decryptSecret(await getSetting("ai.provider.anthropic.key"))
  const apiKey = dbKey || (hasEnv("ANTHROPIC_API_KEY") ? env.ANTHROPIC_API_KEY : null)

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY tanımlanmamış — Entegrasyonlar sayfasından veya `.env.local` dosyasından ekleyin."
    )
  }

  _client = new Anthropic({ apiKey })
  return _client
}

// ── Run helper ─────────────────────────────────────────────
export interface RunClaudeInput {
  system?: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  /** Default: 4096 — bump for full-article writes. */
  maxTokens?: number
  /** Default: 0.7 — lower for structured JSON. */
  temperature?: number
  /** Defaults to {@link DEFAULT_MODEL}. */
  model?: string
}

export interface StreamClaudeInput extends RunClaudeInput {}

/**
 * Returns an async generator that yields text chunks from Claude.
 */
export async function* streamClaude(input: StreamClaudeInput) {
  const client = await getAnthropic()

  const stream = await client.messages.create({
    model:       input.model       ?? DEFAULT_MODEL,
    max_tokens:  input.maxTokens   ?? 4096,
    temperature: input.temperature ?? 0.7,
    system:      input.system,
    messages:    input.messages,
    stream:      true,
  })

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text
    }
  }
}

export interface RunClaudeResult {
  text: string
  inputTokens: number
  outputTokens: number
  model: string
  stopReason: string | null
}

/**
 * Wraps `client.messages.create` and returns the first text
 * block joined as a single string. Throws on API errors so
 * callers can decide retry vs. surface to user.
 */
export async function runClaude(input: RunClaudeInput): Promise<RunClaudeResult> {
  const client = await getAnthropic()

  const response = await client.messages.create({
    model:       input.model       ?? DEFAULT_MODEL,
    max_tokens:  input.maxTokens   ?? 4096,
    temperature: input.temperature ?? 0.7,
    system:      input.system,
    messages:    input.messages,
  })

  // The SDK returns a discriminated union of content blocks; we
  // only request text so flatten any text blocks into one string.
  const text = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()

  return {
    text,
    inputTokens:  response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model:        response.model,
    stopReason:   response.stop_reason ?? null,
  }
}

/**
 * Cheap dev-time token estimator — chars / 4 is the well-known
 * rule of thumb. Used by audit log when a real usage number is
 * not available (e.g. before the request completes).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
