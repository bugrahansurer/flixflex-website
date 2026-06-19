"use client"

import React, { useState, FormEvent } from "react"
import { Globe, ImageIcon, Search, Layout, Save, Loader2 } from "@/lib/icons"
import { FFButton, FFInput, FFSlider, FFTextarea } from "@/components/ui"
import { ImagePicker } from "@/components/admin/media/image-picker"
import { toast } from "sonner"

interface SiteSettingsFormProps {
  initialSettings: Record<string, string>
  saveAction: (formData: FormData) => Promise<void>
}

export function SiteSettingsForm({ initialSettings, saveAction }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData()
    Object.entries(settings).forEach(([key, value]) => {
      formData.append(key, value)
    })

    try {
      await saveAction(formData)
      toast.success("Ayarlar kaydedildi")
    } catch {
      toast.error("Kaydetme hatası")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* ── Section: Genel ──────────────────── */}
      <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
          <Globe size={18} className="text-[#ff4fd8]" />
          <h2 className="font-display text-lg text-[#333333] font-bold">Genel Bilgiler</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Site Adı</label>
            <FFInput
              value={settings.site_name || ""}
              onChange={(e) => updateSetting("site_name", e.target.value)}
              placeholder="Örn: FlixFlex"
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Slogan (Tagline)</label>
            <FFInput
              value={settings.site_tagline || ""}
              onChange={(e) => updateSetting("site_tagline", e.target.value)}
              placeholder="Örn: Next-Gen Reklam Ajansı"
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">E-posta</label>
            <FFInput
              value={settings.site_email || ""}
              onChange={(e) => updateSetting("site_email", e.target.value)}
              placeholder="merhaba@domain.com"
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Telefon</label>
            <FFInput
              value={settings.site_phone || ""}
              onChange={(e) => updateSetting("site_phone", e.target.value)}
              placeholder="+90 ..."
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-bold text-[#333333]">Adres</label>
            <FFTextarea
              value={settings.site_address || ""}
              onChange={(e) => updateSetting("site_address", e.target.value)}
              placeholder="Şirket merkezi adresi..."
              className="w-full bg-transparent border border-[#CCCCCC] p-3 text-sm text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#ff4fd8] transition-colors resize-y"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Çalışma Saatleri</label>
            <FFInput
              value={settings.site_working_hours || ""}
              onChange={(e) => updateSetting("site_working_hours", e.target.value)}
              placeholder="Örn: Pzt - Cum: 09:00 - 18:00"
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Vergi Dairesi / No</label>
            <div className="grid grid-cols-2 gap-2">
              <FFInput
                value={settings.site_tax_office || ""}
                onChange={(e) => updateSetting("site_tax_office", e.target.value)}
                placeholder="Daire"
                className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              />
              <FFInput
                value={settings.site_tax_number || ""}
                onChange={(e) => updateSetting("site_tax_number", e.target.value)}
                placeholder="Numara"
                className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Görsel ─────────────────── */}
      <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
          <ImageIcon size={18} className="text-[var(--ff-purple)]" />
          <h2 className="font-display text-lg text-[#333333] font-bold">Marka Görselleri</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <ImagePicker
            label="Ana Logo (Açık Zemin)"
            value={settings.site_logo || ""}
            onChange={(url) => updateSetting("site_logo", url)}
          />
          <ImagePicker
            label="Beyaz Logo (Koyu Zemin)"
            value={settings.site_logo_white || ""}
            onChange={(url) => updateSetting("site_logo_white", url)}
          />
          <ImagePicker
            label="Şeffaf Header Logosu"
            value={settings.site_logo_transparent || ""}
            onChange={(url) => updateSetting("site_logo_transparent", url)}
          />
          <ImagePicker
            label="Site Favicon"
            value={settings.site_favicon || ""}
            onChange={(url) => updateSetting("site_favicon", url)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 border-t border-[#cccccc] pt-8">
          <div className="space-y-4">
            <FFSlider
              label="Masaüstü Logo Yüksekliği"
              unit="px"
              min={16}
              max={120}
              step={1}
              value={[settings.site_logo_height ? parseInt(settings.site_logo_height) : 32]}
              onValueChange={([val]) => updateSetting("site_logo_height", val.toString())}
            />
            <p className="text-[10px] text-[var(--foreground-faint)] leading-relaxed">
              Sidebar ve Header&apos;daki logonun dikey boyutu. Çok büyük değerler arayüzü bozabilir.
            </p>
          </div>
          <div className="space-y-4">
            <FFSlider
              label="Mobil Logo Yüksekliği"
              unit="px"
              min={12}
              max={80}
              step={1}
              value={[settings.site_logo_mobile_height ? parseInt(settings.site_logo_mobile_height) : 24]}
              onValueChange={([val]) => updateSetting("site_logo_mobile_height", val.toString())}
            />
            <p className="text-[10px] text-[var(--foreground-faint)] leading-relaxed">
              Mobil cihazlarda logonun dikey boyutu. Genellikle 20-30px arası idealdir.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section: SEO ────────────────────── */}
      <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
          <Search size={18} className="text-[var(--ff-purple)]" />
          <h2 className="font-display text-lg text-[#333333] font-bold">SEO & Meta</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Global Meta Başlığı</label>
            <FFInput
              value={settings.site_meta_title || ""}
              onChange={(e) => updateSetting("site_meta_title", e.target.value)}
              placeholder="Arama sonuçlarında görünecek başlık"
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Global Meta Açıklaması</label>
            <textarea
              value={settings.site_meta_description || ""}
              onChange={(e) => updateSetting("site_meta_description", e.target.value)}
              className="ff-shape-container w-full min-h-[100px] bg-transparent border border-[#CCCCCC] p-3 text-sm text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#ff4fd8] transition-colors resize-y"
              placeholder="Site hakkında kısa açıklama..."
            />
          </div>
        </div>
      </section>

      {/* ── Section: Sosyal ─────────────────── */}
      <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
          <Layout size={18} className="text-[#FF4FD8]" />
          <h2 className="font-display text-lg text-[#333333] font-bold">Sosyal Medya</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Instagram</label>
            <FFInput
              value={settings.social_instagram || ""}
              onChange={(e) => updateSetting("social_instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">LinkedIn</label>
            <FFInput
              value={settings.social_linkedin || ""}
              onChange={(e) => updateSetting("social_linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/..."
              className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
            />
          </div>
        </div>
      </section>

      {/* ── Actions ────────────────────────── */}
      <div className="flex justify-end pt-4">
        <FFButton type="submit" size="lg" className="px-10 h-12" disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
          Ayarları Kaydet
        </FFButton>
      </div>
    </form>
  )
}
