"use client"

import * as React from "react"
import { FFButton, FFInput } from "@/components/ui"
import {
  Plug,
  Save,
  KeyRound,
  CheckCircle2,
  Loader2,
  Sparkles,
  BarChart3,
  Mail,
  Share2,
  Globe
} from "@/lib/icons"
import { Can } from "@/components/admin/rbac/permission-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface IntegrationsData {
  // AI
  anthropicKey: string
  openaiKey: string
  geminiKey: string
  defaultModel: string

  // Analytics
  gaMeasurementId: string
  gtmId: string
  pixelId: string

  // Marketing & Mail
  resendApiKey: string
  mailchimpKey: string
}

export function IntegrationForm({ initialData }: { initialData: IntegrationsData }) {
  const [data, setData] = React.useState<IntegrationsData>(initialData)
  const [loading, setLoading] = React.useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/settings/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error("Ayarlar kaydedilemedi.")

      toast.success("Entegrasyon ayarları başarıyla kaydedildi.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-16 pb-20">
      {/* ── SECTION: AI SERVISLERI ────────────────────────────────────────── */}
      <section className="space-y-6">
        <header className="flex items-center gap-3 pb-2 border-b border-[#CCCCCC]">
          <Sparkles size={20} className="text-[var(--ff-purple)]" />
          <h2 className="font-display text-xl font-bold text-[#333333]">Yapay Zeka (AI) Servisleri</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anthropic */}
          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="ff-shape-button w-10 h-10 flex items-center justify-center bg-[var(--ff-purple)/0.1] text-[var(--ff-purple)] border border-[var(--ff-purple)/0.2]">
                <Plug size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#333333]">Anthropic (Claude)</h3>
                <p className="text-[10px] text-[#666666] uppercase tracking-widest font-semibold">Ana Sağlayıcı</p>
              </div>
              {data.anthropicKey && <CheckCircle2 size={16} className="ml-auto text-green-500" />}
            </div>
            <FFInput
              label="Anthropic API Key"
              type="password"
              placeholder="sk-ant-..."
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.anthropicKey}
              onChange={(e) => setData({ ...data, anthropicKey: e.target.value })}
            />
          </div>

          {/* OpenAI */}
          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="ff-shape-button w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-500 border border-green-500/20">
                <Plug size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#333333]">OpenAI (GPT)</h3>
                <p className="text-[10px] text-[#666666] uppercase tracking-widest font-semibold">Alternatif</p>
              </div>
              {data.openaiKey && <CheckCircle2 size={16} className="ml-auto text-green-500" />}
            </div>
            <FFInput
              label="OpenAI API Key"
              type="password"
              placeholder="sk-..."
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.openaiKey}
              onChange={(e) => setData({ ...data, openaiKey: e.target.value })}
            />
          </div>

          {/* Gemini */}
          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="ff-shape-button w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Plug size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#333333]">Google Gemini</h3>
                <p className="text-[10px] text-[#666666] uppercase tracking-widest font-semibold">Multimodal</p>
              </div>
              {data.geminiKey && <CheckCircle2 size={16} className="ml-auto text-green-500" />}
            </div>
            <FFInput
              label="Google AI Key"
              type="password"
              placeholder="AIza..."
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.geminiKey}
              onChange={(e) => setData({ ...data, geminiKey: e.target.value })}
            />
          </div>

          {/* Default Model */}
          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="ff-shape-button w-10 h-10 flex items-center justify-center bg-[#333333]/5 text-[#333333] border border-[#CCCCCC]">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#333333]">Varsayılan Model</h3>
                <p className="text-[10px] text-[#666666] uppercase tracking-widest font-semibold">Global Seçim</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#666666]">Model Seçimi</label>
              <select
                value={data.defaultModel}
                onChange={(e) => setData({ ...data, defaultModel: e.target.value })}
                className={cn(
                  "ff-shape-button w-full bg-[#FFFFFF] border border-[#CCCCCC]",
                  "px-4 py-3 text-sm text-[#333333] outline-none",
                  "focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/50 focus:ring-1",
                )}
              >
                <optgroup label="Anthropic">
                  <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </optgroup>
                <optgroup label="OpenAI">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </optgroup>
                <optgroup label="Google">
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: ANALIZ & IZLEME ──────────────────────────────────────── */}
      <section className="space-y-6">
        <header className="flex items-center gap-3 pb-2 border-b border-[#CCCCCC]">
          <BarChart3 size={20} className="text-blue-500" />
          <h2 className="font-display text-xl font-bold text-[#333333]">Analiz & İzleme</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={18} className="text-orange-500" />
              <h3 className="font-display text-sm font-bold text-[#333333]">Google Analytics</h3>
            </div>
            <FFInput
              label="Measurement ID"
              placeholder="G-XXXXXXXXXX"
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.gaMeasurementId}
              onChange={(e) => setData({ ...data, gaMeasurementId: e.target.value })}
            />
          </div>

          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={18} className="text-blue-600" />
              <h3 className="font-display text-sm font-bold text-[#333333]">Google Tag Manager</h3>
            </div>
            <FFInput
              label="GTM Container ID"
              placeholder="GTM-XXXXXXX"
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.gtmId}
              onChange={(e) => setData({ ...data, gtmId: e.target.value })}
            />
          </div>

          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-4">
              <Share2 size={18} className="text-blue-500" />
              <h3 className="font-display text-sm font-bold text-[#333333]">Meta Pixel</h3>
            </div>
            <FFInput
              label="Pixel ID"
              placeholder="1234567890..."
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.pixelId}
              onChange={(e) => setData({ ...data, pixelId: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION: PAZARLAMA & E-POSTA ───────────────────────────────────── */}
      <section className="space-y-6">
        <header className="flex items-center gap-3 pb-2 border-b border-[#CCCCCC]">
          <Mail size={20} className="text-orange-500" />
          <h2 className="font-display text-xl font-bold text-[#333333]">Pazarlama & E-Posta</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={18} className="text-green-500" />
              <h3 className="font-display text-sm font-bold text-[#333333]">Resend</h3>
              {data.resendApiKey && <CheckCircle2 size={14} className="ml-auto text-green-500" />}
            </div>
            <FFInput
              label="Resend API Key"
              type="password"
              placeholder="re_..."
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.resendApiKey}
              onChange={(e) => setData({ ...data, resendApiKey: e.target.value })}
              hint="Sistem e-postaları için ana sağlayıcı."
            />
          </div>

          <div className="ff-shape-container ff-card">
            <div className="flex items-center gap-3 mb-4">
              <Share2 size={18} className="text-[#333333]" />
              <h3 className="font-display text-sm font-bold text-[#333333]">Mailchimp</h3>
            </div>
            <FFInput
              label="Mailchimp API Key"
              type="password"
              placeholder="API Key"
              className="bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              value={data.mailchimpKey}
              onChange={(e) => setData({ ...data, mailchimpKey: e.target.value })}
              hint="Bülten ve kampanya yönetimi için."
            />
          </div>
        </div>
      </section>

      {/* ── Footer Actions ───────────────────── */}
      <Can resource="settings" action="update">
        <div className="ff-shape-container sticky bottom-4 z-20 flex flex-wrap items-center justify-end gap-2 sm:gap-4 p-4 bg-[#F7F7F5]/40 backdrop-blur-sm border border-[#CCCCCC]">
          <p className="mr-auto text-[11px] text-[#666666] hidden md:block italic">
            * Değişiklikleri kaydetmeyi unutmayın.
          </p>
          <FFButton
            variant="ghost"
            disabled={loading}
            onClick={() => setData(initialData)}
          >
            Sıfırla
          </FFButton>
          <FFButton
            onClick={handleSave}
            disabled={loading}
            leftIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          >
            {loading ? "Kaydediliyor..." : "Tüm Entegrasyonları Kaydet"}
          </FFButton>
        </div>
      </Can>
    </div>
  )
}
