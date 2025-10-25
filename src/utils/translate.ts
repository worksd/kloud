'use server'
import { cookies } from 'next/headers';
import { Locale, StringResource, StringResourceKey } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

// 서버 컴포넌트에서 사용할 함수들
export const getLocale = async (): Promise<Locale> => {
  const cookieLocale = (await cookies()).get(localeKey)?.value;
  const isValidLocale = (lang: string | undefined): lang is Locale =>
    lang !== undefined && ['ko', 'en', 'jp', 'zh'].includes(lang);

  return isValidLocale(cookieLocale) ? cookieLocale : "ko";
};

export const translate = async (key: StringResourceKey): Promise<string> => {
  return StringResource[key]?.[await getLocale()] || key;
};

export const changeLocale = async (newLocale: Locale) => {
  const cookie = await cookies();
  cookie.set(localeKey, newLocale, {
    maxAge: 2592000,
    sameSite: 'lax',
  })
};