import { runClaude, streamClaude } from "./providers/anthropic"
import { runOpenAI, streamOpenAI } from "./providers/openai"
import { runGemini, streamGemini } from "./providers/gemini"
import { getSetting } from "@/lib/settings"

export type AIProvider = "anthropic" | "openai" | "google"

export interface AIMessage {
  role: "user" | "assistant"
  content: string
}

export interface AIRequest {
  provider?: AIProvider
  model?: string
  system?: string
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
}

export interface AIResponse {
  text: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

/**
 * Detect provider from model name if not explicitly provided.
 */
export function detectProvider(model: string): AIProvider {
  const m = model.toLowerCase()
  if (m.startsWith("claude-")) return "anthropic"
  if (m.startsWith("gpt-") || m.startsWith("o1-")) return "openai"
  if (m.startsWith("gemini-")) return "google"
  return "anthropic" // fallback
}

export async function runAI(req: AIRequest): Promise<AIResponse> {
  // 1. Determine model (req.model OR DB setting OR fallback)
  const finalModel = req.model ?? (await getSetting("ai.default.model", "claude-3-5-sonnet-20240620"))!
  
  // 2. Determine provider
  const provider = req.provider ?? detectProvider(finalModel)

  const finalReq = { ...req, model: finalModel }

  switch (provider) {
    case "anthropic":
      const res = await runClaude(finalReq)
      return {
        text: res.text,
        usage: { inputTokens: res.inputTokens, outputTokens: res.outputTokens }
      }
    case "openai":
      return runOpenAI(finalReq)
    case "google":
      return runGemini(finalReq)
    default:
      throw new Error(`Bilinmeyen sağlayıcı: ${provider}`)
  }
}

export async function* streamAI(req: AIRequest) {
  // 1. Determine model
  const finalModel = req.model ?? (await getSetting("ai.default.model", "claude-3-5-sonnet-20240620"))!
  
  // 2. Determine provider
  const provider = req.provider ?? detectProvider(finalModel)

  const finalReq = { ...req, model: finalModel }

  switch (provider) {
    case "anthropic":
      yield* streamClaude(finalReq)
      break
    case "openai":
      yield* streamOpenAI(finalReq)
      break
    case "google":
      yield* streamGemini(finalReq)
      break
    default:
      throw new Error(`${provider} için streaming desteği henüz eklenmedi.`)
  }
}
