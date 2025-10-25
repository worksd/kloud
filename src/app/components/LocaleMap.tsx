import { Locale } from "@/shared/StringResource";


export const LOCALE_MAP: Record<Locale, { emoji: string, name: string }> = {
  ko: {emoji: '🇰🇷', name: '한국어'},
  en: {emoji: '🇺🇸', name: 'English'},
  jp: {emoji: '🇯🇵', name: '日本語'},
  zh: {emoji: '🇨🇳', name: '中文'}
} as const;
