import prisma from "@/lib/prisma"

export type SettingType = "string" | "json" | "boolean" | "number"

export interface SiteSettingValue {
  key: string
  value: string
  type: SettingType
}

/**
 * Get a single setting by key.
 */
export async function getSetting<T = string>(key: string, defaultValue?: T): Promise<T | undefined> {
  if (!prisma) return defaultValue

  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key } })
    if (!setting) return defaultValue

    return parseSettingValue(setting.value, setting.type as SettingType) as T
  } catch (err) {
    console.error(`[getSetting] Error fetching key "${key}":`, err)
    return defaultValue
  }
}

/**
 * Get multiple settings by prefix.
 */
export async function getSettingsByPrefix(prefix: string): Promise<Record<string, any>> {
  if (!prisma) return {}

  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: prefix } },
    })

    const result: Record<string, any> = {}
    settings.forEach((s: { key: string; value: string; type: string }) => {
      const subKey = s.key.replace(prefix, "")
      result[subKey] = parseSettingValue(s.value, s.type as SettingType)
    })
    return result
  } catch (err) {
    console.error(`[getSettingsByPrefix] Error fetching prefix "${prefix}":`, err)
    return {}
  }
}

/**
 * Set a setting value.
 */
export async function setSetting(key: string, value: any, type: SettingType = "string"): Promise<void> {
  if (!prisma) return

  const stringValue = serializeSettingValue(value, type)

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: stringValue, type },
    create: { key, value: stringValue, type },
  })
}

function parseSettingValue(value: string, type: SettingType): any {
  switch (type) {
    case "boolean":
      return value === "true"
    case "number":
      return Number(value)
    case "json":
      try {
        return JSON.parse(value)
      } catch {
        return {}
      }
    default:
      return value
  }
}

function serializeSettingValue(value: any, type: SettingType): string {
  switch (type) {
    case "json":
      return JSON.stringify(value)
    default:
      return String(value)
  }
}
