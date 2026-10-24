// 화면 테마 — 설정 > 화면 테마에서 고른다. 쿠키(themeKey)에 저장, 서버가 <html data-theme> 로 심어 첫 페인트부터 적용.
//  - 'system': 기기(OS) 설정을 따른다. 서버는 모르니 head 인라인 스크립트가 matchMedia 로 결정 + ThemeSync 가 변경을 듣는다.
//  - 'light' | 'dark': 고정.
// 쿠키가 없으면 light (기존 동작 그대로 — 사용자가 직접 켜야 다크가 된다).
export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = typeof THEME_PREFERENCES[number];
/** 실제 렌더에 쓰이는 값 */
export type ResolvedTheme = 'light' | 'dark';

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'light';

export const isThemePreference = (v: unknown): v is ThemePreference =>
  typeof v === 'string' && (THEME_PREFERENCES as readonly string[]).includes(v);

/** <html> 속성 이름 — data-theme 은 실제 적용값(CSS 가 본다), data-theme-pref 는 사용자 선택값(클라이언트가 본다) */
export const THEME_ATTR = 'data-theme';
export const THEME_PREF_ATTR = 'data-theme-pref';

/** 브라우저에서 선택값 → 실제값. system 이면 OS 설정 */
export const resolveThemeInBrowser = (pref: ThemePreference): ResolvedTheme => {
  if (pref !== 'system') return pref;
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/** <html> 에 테마를 반영. 라이트는 속성을 지운다(CSS 기본 = 라이트) */
export const applyThemeToDocument = (pref: ThemePreference) => {
  const root = document.documentElement;
  root.setAttribute(THEME_PREF_ATTR, pref);
  const resolved = resolveThemeInBrowser(pref);
  if (resolved === 'dark') root.setAttribute(THEME_ATTR, 'dark');
  else root.removeAttribute(THEME_ATTR);
};

/**
 * head 에 넣는 no-flash 스크립트 — 'system' 일 때만 필요. hydration 전에 OS 설정을 읽어 data-theme 을 맞춘다.
 * (light/dark 고정은 서버가 이미 속성을 찍어 보내므로 스크립트 불필요)
 */
export const SYSTEM_THEME_BOOT_SCRIPT =
  `try{if(matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('${THEME_ATTR}','dark')}}catch(e){}`;
