'use server'
import { cookies } from 'next/headers';
import { StringResource } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

// 서버 컴포넌트에서 사용할 함수들
export const getLocale = async (): Promise<keyof typeof StringResource> => {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(localeKey)?.value;
  return cookieLang && cookieLang in StringResource ? (cookieLang as keyof typeof StringResource) : "en";
};

export const translate = async (key: keyof (typeof StringResource)["ko"]): Promise<string> => {
  const locale = await getLocale();
  return StringResource[locale]?.[key] || key;
};
