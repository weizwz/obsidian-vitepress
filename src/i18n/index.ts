import { getLanguage } from 'obsidian'
import { en, type LocaleMessages } from './locales/en'
import { zh } from './locales/zh'

export type LanguageSetting = 'auto' | 'en' | 'zh'
export type ResolvedLanguage = 'en' | 'zh'

const LOCALES: Record<ResolvedLanguage, LocaleMessages> = {
  en,
  zh
}

export function resolveLanguage(setting: LanguageSetting): ResolvedLanguage {
  if (setting === 'en' || setting === 'zh') {
    return setting
  }
  const obsidianLang = getLanguage().toLowerCase()
  return obsidianLang.startsWith('zh') ? 'zh' : 'en'
}

export function getMessages(setting: LanguageSetting): LocaleMessages {
  return LOCALES[resolveLanguage(setting)]
}

export type { LocaleMessages }
