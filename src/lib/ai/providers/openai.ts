import OpenAI from "openai"
import { env, hasEnv } from "@/lib/env"
import { getSetting } from "@/lib/settings"
import { decryptSecret } from "@/lib/crypto"
import type { AIRequest, AIResponse } from "../engine"

export const DEFAULT_OPENAI_MODEL = "gpt-4o"

let _client: OpenAI | null = null

export async function getOpenAI(): Promise<OpenAI> {
  if (_client) return _client

  const dbKey = decryptSecret(await getSetting("ai.provider.openai.key"))
  const apiKey = dbKey || (hasEnv("OPENAI_API_KEY") ? env.OPENAI_API_KEY : null)

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY tanımlanmamış — Entegrasyonlar sayfasından veya `.env.local` dosyasından ekleyin."
    )
  }

  _client = new OpenAI({ apiKey })
  return _client
}

export async function runOpenAI(req: AIRequest): Promise<AIResponse> {
  const client = await getOpenAI()

  const response = await client.chat.completions.create({
    model: req.model ?? DEFAULT_OPENAI_MODEL,
    messages: [
      ...(req.system ? [{ role: "system" as const, content: req.system }] : []),
      ...req.messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }))
    ],
    max_tokens: req.maxTokens ?? 4096,
    temperature: req.temperature ?? 0.7,
  })

  const text = response.choices[0]?.message?.content ?? ""

  return {
    text: text.trim(),
    usage: {
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0
    }
  }
}

export async function* streamOpenAI(req: AIRequest) {
  const client = await getOpenAI()

  const stream = await client.chat.completions.create({
    model: req.model ?? DEFAULT_OPENAI_MODEL,
    messages: [
      ...(req.system ? [{ role: "system" as const, content: req.system }] : []),
      ...req.messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }))
    ],
    max_tokens: req.maxTokens ?? 4096,
    temperature: req.temperature ?? 0.7,
    stream: true,
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? ""
    if (text) yield text
  }
}
