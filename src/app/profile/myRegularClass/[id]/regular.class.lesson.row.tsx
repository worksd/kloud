// 내 정규반 상세 — 수업 행(날짜 타일 + 제목 / 시간·홀 + 상태 칩)과 날짜 유틸. 서버 목록과 클라이언트(일정 변경으로 새로 생긴 수업) 공용.

import React from "react";
import { Locale } from "@/shared/StringResource";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const WEEKDAYS: Record<string, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

// 'yyyy.MM.dd HH:mm' → 구성 요소 + KST epoch. 서버(UTC)에서 렌더돼도 문자열을 KST 로 고정 해석
export const parts = (s?: string) => {
  const m = s?.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:\D+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh = '0', mm = '0'] = m;
  const at = new Date(`${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00+09:00`).getTime();
  const weekday = new Date(Number(y), Number(mo) - 1, Number(d)).getDay();
  return { year: Number(y), month: Number(mo), day: Number(d), weekday, time: m[4] != null ? `${hh.padStart(2, '0')}:${mm}` : null, at };
};

/** '10.29 (수) · 19:00 ~ 20:30' — 시트·이력에서 쓰는 한 줄 표기 */
export const formatLessonWhen = (locale: Locale, startDate?: string, endDate?: string) => {
  const p = parts(startDate);
  if (!p) return '';
  const wd = (WEEKDAYS[locale] ?? WEEKDAYS.en)[p.weekday];
  const end = parts(endDate)?.time;
  const time = p.time && (end ? `${p.time} ~ ${end}` : p.time);
  return [`${p.month}.${p.day} (${wd})`, time].filter(Boolean).join(' · ');
};

export type Kind = 'upcoming' | 'attended' | 'cancelled' | 'other';
export const chipClass: Record<Kind, string> = {
  upcoming: 'bg-[#191F28] text-white',
  attended: 'bg-[#EAF7EE] text-[#1B7F3B]',
  cancelled: 'bg-[#FDECEC] text-[#E55B5B]',
  other: 'bg-[#F2F4F6] text-[#8B95A1]',
};
export const chipBase = 'shrink-0 px-2 py-[3px] rounded-[6px] text-[11px] font-bold tracking-[-0.1px] whitespace-nowrap';

export const LessonRow = ({ title, startDate, endDate, roomName, artistName, locale, isPast, route, chip }: {
  title: string;
  startDate?: string;
  endDate?: string;
  roomName?: string;
  /** 메인 강사 이름 (수강 내역 행) */
  artistName?: string;
  locale: Locale;
  isPast: boolean;
  /** 있으면 탭해서 이동 (수강권 상세) */
  route?: string;
  chip: React.ReactNode;
}) => {
  const p = parts(startDate);
  const end = parts(endDate)?.time;
  const sub = [p?.time && (end ? `${p.time} ~ ${end}` : p.time), roomName, artistName].filter(Boolean).join(' · ');
  const wd = (WEEKDAYS[locale] ?? WEEKDAYS.en)[p?.weekday ?? 0];

  const row = (
    <div className={`flex items-center gap-4 py-3.5 ${route ? 'active:bg-[#F9FAFB] cursor-pointer transition-colors' : ''}`}>
      {/* 날짜 타일 */}
      <div className={`w-[48px] h-[52px] rounded-[12px] flex flex-col items-center justify-center shrink-0 ${isPast ? 'bg-[#F7F8FA]' : 'bg-[#191F28]'}`}>
        <span className={`text-[16px] font-bold font-paperlogy leading-none ${isPast ? 'text-[#8B95A1]' : 'text-white'}`}>{p?.day ?? '-'}</span>
        <span className={`text-[10.5px] font-semibold mt-1 leading-none ${isPast ? 'text-[#B0B8C1]' : 'text-white/70'}`}>{p ? `${p.month}.${wd}` : ''}</span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className={`text-[15px] font-semibold truncate tracking-[-0.3px] ${isPast ? 'text-[#8B95A1]' : 'text-[#191F28]'}`}>{title}</p>
        {sub && <p className={`text-[12.5px] truncate tracking-[-0.2px] ${isPast ? 'text-[#B0B8C1]' : 'text-[#4E5968]'}`}>{sub}</p>}
      </div>
      {chip}
    </div>
  );
  return route ? <NavigateClickWrapper method="push" route={route}>{row}</NavigateClickWrapper> : row;
};

/** 목록 섹션 — 제목 + (알면) 개수 */
export const LessonSection = ({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) => (
  <section>
    <div className="flex items-baseline gap-2 mb-1">
      <h3 className="text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">{title}</h3>
      {count != null && <span className="text-[12.5px] font-semibold text-[#B0B8C1] font-paperlogy">{count}</span>}
    </div>
    <div className="flex flex-col divide-y divide-[#F2F4F6]">{children}</div>
  </section>
);
