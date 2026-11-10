"use client"

import { createContext } from "react"
import type { SectionBlock } from "@/types/page-builder"

/**
 * Sayfa düzenleyicinin canlı önizlemesi (iframe) bu context ile düzenleyicideki
 * kaydedilmemiş bölümleri PageRenderer'a iletir. Varsayılan null: sitede hiçbir
 * etkisi yoktur, PageRenderer kendi `sections` prop'unu kullanır.
 */
export const BuilderPreviewContext = createContext<SectionBlock[] | null>(null)

/** iframe ile düzenleyici arasındaki mesajların kaynak etiketleri */
export const BUILDER_MSG_SOURCE = "ff-builder"
export const PREVIEW_MSG_SOURCE = "ff-preview"
