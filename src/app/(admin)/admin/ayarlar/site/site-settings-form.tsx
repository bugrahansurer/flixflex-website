"use client"

import React, { useState, FormEvent } from "react"
import { Globe, ImageIcon, Search, Layout, Save, Loader2, Plus, Trash2 } from "@/lib/icons"
import { FFButton, FFInput, FFSlider, FFTextarea } from "@/components/ui"
import { ImagePicker } from "@/components/admin/media/image-picker"
import { SocialIcon } from "@/components/public/footer/social-icon"
import { SOCIAL_PLATFORMS, platformLabel, type SocialLinkItem } from "@/lib/social-platforms"
import { Can } from "@/components/admin/rbac/permission-context"
import { toast } from "sonner"

// Read the current social links from the settings map, migrating legacy
// single-field keys (social_instagram / social_linkedin) on first load.
function readSocialLinks(s: Record<string, string>): SocialLinkItem[] {
  const raw = s.site_social_links
  if (raw && raw.trim()) {
    try {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return arr as SocialLinkItem[]
    } catch { /* fall through to legacy */ }
  }
  const legacy: SocialLinkItem[] = []
  if (s.social_instagram) legacy.push({ platform: "instagram", label: "Instagram", url: s.social_instagram })
  if (s.social_linkedin) legacy.push({ platform: "linkedin", label: "LinkedIn", url: s.social_linkedin })
  return legacy
}

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

  // ── Dynamic social links ────────────────────────────────
  const socialLinks = readSocialLinks(settings)
  const writeSocial = (next: SocialLinkItem[]) =>
    updateSetting("site_social_links", JSON.stringify(next))

  const addSocial = () => {
    const used = new Set(socialLinks.map((l) => l.platform))
    const nextPlatform = SOCIAL_PLATFORMS.find((p) => !used.has(p.key))?.key ?? "instagram"
    writeSocial([...socialLinks, { platform: nextPlatform, label: platformLabel(nextPlatform), url: "" }])
  }
  const updateSocial = (index: number, patch: Partial<SocialLinkItem>) => {
    writeSocial(
      socialLinks.map((l, i) => {
        if (i !== index) return l
        const merged = { ...l, ...patch }
        if (patch.platform) merged.label = platformLabel(patch.platform)
        return merged
      }),
    )
  }
  const removeSocial = (index: number) =>
    writeSocial(socialLinks.filter((_, i) => i !== index))

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* ── Section: Genel ──────────────────── */}
      <section className="ff-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
          <Globe size={18} className="text-[#ff4fd8]" />
          <h2 className="font-display text-lg text-[#333333] font-bold">Genel Bilgiler</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Site Adı</label>
            <FFInput
              value={settings.site_name || ""}
              onChange={(e) => updateSetting("site_name", e.target.value)}
              placeholder="Örn: FlixFlex"
              className="w-full h-9 bg-transparent text-[#333333]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Slogan (Tagline)</label>
            <FFInput
              value={settings.site_tagline || ""}
              onChange={(e) => updateSetting("site_tagline", e.target.value)}
              placeholder="Örn: Next-Gen Reklam Ajansı"
              className="w-full h-9 bg-transparent text-[#333333]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">E-posta</label>
            <FFInput
              value={settings.site_email || ""}
              onChange={(e) => updateSetting("site_email", e.target.value)}
              placeholder="merhaba@domain.com"
              className="w-full h-9 bg-transparent text-[#333333]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Telefon</label>
            <FFInput
              value={settings.site_phone || ""}
              onChange={(e) => updateSetting("site_phone", e.target.value)}
              placeholder="+90 ..."
              className="w-full h-9 bg-transparent text-[#333333]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-bold text-[#333333]">Adres</label>
            <FFTextarea
              value={settings.site_address || ""}
              onChange={(e) => updateSetting("site_address", e.target.value)}
              placeholder="Şirket merkezi adresi..."
              className="w-full bg-transparent text-[#333333] resize-y"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Çalışma Saatleri</label>
            <FFInput
              value={settings.site_working_hours || ""}
              onChange={(e) => updateSetting("site_working_hours", e.target.value)}
              placeholder="Örn: Pzt - Cum: 09:00 - 18:00"
              className="w-full h-9 bg-transparent text-[#333333]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#333333]">Vergi Dairesi / No</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FFInput
                value={settings.site_tax_office || ""}
                onChange={(e) => updateSetting("site_tax_office", e.target.value)}
                placeholder="Daire"
                className="w-full h-9 bg-transparent text-[#333333]"
              />
              <FFInput
                value={settings.site_tax_number || ""}
                onChange={(e) => updateSetting("site_tax_number", e.target.value)}
                placeholder="Numara"
                className="w-full h-9 bg-transparent text-[#333333]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Görsel ─────────────────── */}
      <section className="ff-card space-y-6">
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
      <section className="ff-card space-y-6">
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
              className="ff-shape-button w-full min-h-[100px] bg-transparent border border-[#CCCCCC] p-3 text-sm text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#ff4fd8] transition-colors resize-y"
              placeholder="Site hakkında kısa açıklama..."
            />
          </div>
        </div>
      </section>

      {/* ── Section: Sosyal ─────────────────── */}
      <section className="ff-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#CCCCCC]">
          <div className="flex items-center gap-3">
            <Layout size={18} className="text-[#FF4FD8]" />
            <h2 className="font-display text-lg text-[#333333] font-bold">Sosyal Medya</h2>
          </div>
          <Can resource="settings" action="update">
            <button
              type="button"
              onClick={addSocial}
              className="ff-shape-button inline-flex items-center gap-1.5 h-9 px-3 bg-[#FF4FD8] text-white text-[12px] font-semibold hover:bg-[#e041c0] transition-colors"
            >
              <Plus size={14} /> Platform Ekle
            </button>
          </Can>
        </div>

        <p className="text-[11px] text-[#666666] -mt-2">
          İstediğin platformu ekle/sil. Bunlar footer&apos;da otomatik görünür. Boş URL&apos;li satırlar kaydedilmez.
        </p>

        {socialLinks.length === 0 ? (
          <div className="border border-dashed border-[#CCCCCC] py-8 text-center text-[12px] text-[#999999]">
            Henüz sosyal medya hesabı eklenmedi. &quot;Platform Ekle&quot; ile başla.
          </div>
        ) : (
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="flex items-center gap-2 sm:w-48 shrink-0">
                  <span className="ff-shape-button w-9 h-9 shrink-0 flex items-center justify-center border border-[#CCCCCC] bg-white text-[#333333]">
                    <SocialIcon platform={link.platform} size={16} />
                  </span>
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocial(i, { platform: e.target.value })}
                    className="ff-shape-button w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] focus:outline-none text-xs text-[#333333] px-2"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                    {/* Preserve a custom/legacy platform value not in the catalog */}
                    {!SOCIAL_PLATFORMS.some((p) => p.key === link.platform) && (
                      <option value={link.platform}>{link.label || link.platform}</option>
                    )}
                  </select>
                </div>
                <FFInput
                  value={link.url}
                  onChange={(e) => updateSocial(i, { url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
                />
                <Can resource="settings" action="update">
                  <button
                    type="button"
                    onClick={() => removeSocial(i)}
                    aria-label="Sil"
                    className="ff-shape-button w-9 h-9 shrink-0 flex items-center justify-center border border-[#CCCCCC] text-[#999999] hover:border-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </Can>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Actions ────────────────────────── */}
      <Can resource="settings" action="update">
        <div className="flex justify-end pt-4">
          <FFButton type="submit" size="lg" className="px-4 h-10" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} className="mr-0" />}
            Ayarları Kaydet
          </FFButton>
        </div>
      </Can>
    </form>
  )
}
