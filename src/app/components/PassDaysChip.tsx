import React from "react";
import { Locale } from "@/shared/StringResource";
import { formatPassDays } from "@/utils/pass.days";

// '다니는 요일' 칩 — 요일이 정해진 패스/패스권에만 그린다(비어 있으면 null).
// tone: light(흰/연회색 배경 위) · dark(검은 카드 위)
export const PassDaysChip = ({ days, locale = 'ko', tone = 'light', className = '' }: {
  days?: number[] | null;
  locale?: Locale;
  tone?: 'light' | 'dark';
  className?: string;
}) => {
  const label = formatPassDays(days, locale);
  if (!label) return null;
  const toneClass = tone === 'dark'
    ? 'bg-white/15 text-white'
    : 'bg-[#EEF1F5] text-[#4E5968]';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap ${toneClass} ${className}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2.2"/>
        <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
      {label}
    </span>
  );
};
