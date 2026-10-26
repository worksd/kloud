import React from "react";
import { Locale } from "@/shared/StringResource";
import { TapeTag } from "@/app/components/TapeTag";

// '다니는 요일' — 요일마다 게퍼 테이프 한 조각씩(연습실 바닥 자리 표시처럼), 조각마다 기울기를 살짝 다르게.
// 요일이 정해진 패스/패스권에만 그린다(비어 있으면 null).
// tone: light(흰/연회색 배경 위 — 검정 테이프) · dark(검은 카드 위 — 크림 테이프)
const SHORT: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};
const TILT = [-3, 2, -1.5, 2.5, -2, 1.5, -2.5];

export const PassDaysChip = ({ days, locale = 'ko', tone = 'light', className = '' }: {
  days?: number[] | null;
  locale?: Locale;
  tone?: 'light' | 'dark';
  className?: string;
}) => {
  // 월요일 시작 순서로
  const valid = [...new Set((days ?? []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))]
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  if (valid.length === 0) return null;
  const labels = SHORT[locale] ?? SHORT.en;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {valid.map((d, i) => (
        <TapeTag key={d} tape={tone === 'dark' ? 'cream' : 'black'} rotate={TILT[i % TILT.length]}>{labels[d]}</TapeTag>
      ))}
    </span>
  );
};
