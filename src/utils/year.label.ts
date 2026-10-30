// 월·일 라벨에 연도 붙이기 — 지금(기기 시각) 연도와 다를 때만. '1월 24일' 이 올해 1월인지 내년 1월인지 헷갈리지 않게.
// 홈·시간표·수강 내역·키오스크·관리자 등 월·일만 쓰던 표기가 전부 이 규칙을 탄다.

import { Locale } from "@/shared/StringResource";

/** 연도가 지금과 다른가 */
export const isOtherYear = (year: number, now: Date = new Date()): boolean => year !== now.getFullYear();

/**
 * 말로 된 라벨 — ko '1월 24일' → '2027년 1월 24일', jp/zh '1月24日' → '2027年1月24日', en 'Jan 24' → 'Jan 24, 2027'.
 * 같은 해면 그대로.
 */
export const withYear = (label: string, year: number, locale: Locale, now: Date = new Date()): string => {
  if (!isOtherYear(year, now)) return label;
  switch (locale) {
    case 'ko': return `${year}년 ${label}`;
    case 'jp':
    case 'zh': return `${year}年${label}`;
    default: return `${label}, ${year}`;
  }
};

/** 숫자 라벨 — '6.16' → '2027.6.16', '1/24' → '2027/1/24'. 구분자는 라벨 것을 따른다(없으면 '.') */
export const withYearNumeric = (label: string, year: number, now: Date = new Date()): string => {
  if (!isOtherYear(year, now)) return label;
  const sep = label.includes('/') ? '/' : '.';
  return `${year}${sep}${label}`;
};

/** Intl.DateTimeFormat 옵션에 섞어 쓰는 연도 옵션 — 다른 해면 { year: 'numeric' }, 같은 해면 {} */
export const yearOption = (d: Date, now: Date = new Date()): Intl.DateTimeFormatOptions =>
  isOtherYear(d.getFullYear(), now) ? { year: 'numeric' } : {};
