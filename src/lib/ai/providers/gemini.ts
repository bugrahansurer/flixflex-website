import { GoogleGenerativeAI } from "@google/generative-ai"
import { env, hasEnv } from "@/lib/env"
import { getSetting } from "@/lib/settings"
import { decryptSecret } from "@/lib/crypto"
import type { AIRequest, AIResponse } from "../engine"

export const DEFAULT_GEMINI_MODEL = "gemini-1.5-pro"

let _genAI: GoogleGenerativeAI | null = null

export async function getGemini(): Promise<GoogleGenerativeAI> {
  if (_genAI) return _genAI

  const dbKey = decryptSecret(await getSetting("ai.provider.gemini.key"))
  const apiKey = dbKey || (hasEnv("GOOGLE_AI_KEY") ? env.GOOGLE_AI_KEY : null)

  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_KEY tanımlanmamış — Entegrasyonlar sayfasından veya `.env.local` dosyasından ekleyin."
    )
  }

  _genAI = new GoogleGenerativeAI(apiKey)
  return _genAI
}

export async function runGemini(req: AIRequest): Promise<AIResponse> {
  const genAI = await getGemini()
  const model = genAI.getGenerativeModel({ 
    model: req.model ?? DEFAULT_GEMINI_MODEL,
    systemInstruction: req.system 
  })

  const contents = req.messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }))

  const result = await model.generateContent({
    contents,
    generationConfig: {
      maxOutputTokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.7,
    }
  })

  const response = result.response
  const text = response.text()

  return {
    text: text.trim(),
    usage: {
      inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0
    }
  }
}

export async function* streamGemini(req: AIRequest) {
  const genAI = await getGemini()
  const model = genAI.getGenerativeModel({ 
    model: req.model ?? DEFAULT_GEMINI_MODEL,
    systemInstruction: req.system 
  })

  const contents = req.messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }))

  const result = await model.generateContentStream({
    contents,
    generationConfig: {
      maxOutputTokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.7,
    }
  })

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) yield text
  }
}
