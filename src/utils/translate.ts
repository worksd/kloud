'use server'
import { cookies } from 'next/headers';
import { Locale, StringResource, StringResourceKey } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

// 서버 컴포넌트에서 사용할 함수들
export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(localeKey)?.value;
  console.log(cookieLang)
  const isValidLocale = (lang: string | undefined): lang is Locale =>
    lang !== undefined && ['ko', 'en', 'jp', 'zh'].includes(lang);

  return isValidLocale(cookieLang) ? cookieLang : "ko";
};

export const translate = async (key: StringResourceKey): Promise<string> => {
  const locale = await getLocale();
  return StringResource[key]?.[locale] || key;
};

export const changeLocale = async (newLocale: Locale) => {
  console.log(`change locale ${newLocale}`)
  const cookie = await cookies();
  cookie.set(localeKey, newLocale, {
    maxAge: 2592000,
    sameSite: 'lax',
  })
};

type LocaleInfo = {
  emoji: string;
  name: string;
};

const LOCALE_MAP: Record<Locale, LocaleInfo> = {
  ko: { emoji: '🇰🇷', name: '한국어' },
  en: { emoji: '🇺🇸', name: 'English' },
  jp: { emoji: '🇯🇵', name: '日本語' },
  zh: { emoji: '🇨🇳', name: '中文' }
} as const;

export const getLocaleText = async ({ currentLocale }: { currentLocale: Locale }): Promise<string> => {
  const localeInfo = LOCALE_MAP[currentLocale];
  return `${localeInfo.emoji} ${localeInfo.name}`;
};

export const getLocaleEmoji = async (locale: Locale): Promise<string> => {
  return LOCALE_MAP[locale].emoji;
};

export const getLocaleName = async (locale: Locale): Promise<string> => {
  return LOCALE_MAP[locale].name;
};