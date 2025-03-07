'use server'
import { cookies } from 'next/headers';
import { StringResource } from "@/shared/StringResource";
import { localeKey } from "@/shared/cookies.key";

// 서버 컴포넌트에서 사용할 함수들
export const getLocale = async (): Promise<keyof typeof StringResource> => {
  'use server'
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(localeKey)?.value;
  return cookieLang && cookieLang in StringResource ? (cookieLang as keyof typeof StringResource) : "ko";
};

export const translate = async (key: keyof (typeof StringResource)["ko"]): Promise<string> => {
  const locale = await getLocale();
  return StringResource[locale]?.[key] || key;
};

export const changeLocale = async (newLocale: keyof typeof StringResource) => {
  if (StringResource[newLocale]) {
    const cookie = await cookies();
    cookie.set(localeKey, newLocale, {
      maxAge: 2592000,
      sameSite: 'lax',
    })
  }
};
