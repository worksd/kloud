'use server'
import { cookies } from 'next/headers';
import { COOKIE_MAX_AGE, themeKey } from "@/shared/cookies.key";
import { DEFAULT_THEME_PREFERENCE, isThemePreference, ThemePreference } from "@/shared/theme";

/** 서버 컴포넌트용 — 쿠키의 테마 선택값. 없거나 깨졌으면 light */
export const getThemePreference = async (): Promise<ThemePreference> => {
  const v = (await cookies()).get(themeKey)?.value;
  return isThemePreference(v) ? v : DEFAULT_THEME_PREFERENCE;
};

/** 설정 > 화면 테마에서 호출. 쿠키만 바꾸고, 화면 반영은 호출부가 applyThemeToDocument 로 즉시 처리 */
export const changeThemePreference = async (pref: ThemePreference) => {
  if (!isThemePreference(pref)) return;
  (await cookies()).set(themeKey, pref, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
};
