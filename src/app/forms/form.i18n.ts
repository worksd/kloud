import { Locale, StringResource, StringResourceKey } from '@/shared/StringResource';

// 제휴 신청 화면용 번역 헬퍼 — 서버/클라이언트 양쪽에서 쓴다.
// (components/locale.ts 는 'use client' 라 서버 컴포넌트에서 못 가져온다)
export const fs = (
  locale: Locale,
  key: StringResourceKey,
  vars?: Record<string, string | number>
): string => {
  let s: string = StringResource[key]?.[locale] ?? StringResource[key]?.ko ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  }
  return s;
};

/** 금액 표기 — 원화 고정이라 로케일별로 단위 표기만 바꾼다. */
export const fsWon = (locale: Locale, price: number): string =>
  fs(locale, 'pf_krw', { price: new Intl.NumberFormat('ko-KR').format(price) });
