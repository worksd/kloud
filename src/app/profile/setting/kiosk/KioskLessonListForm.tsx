'use client';

import React, { useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type MockLesson = {
  id: number;
  title: string;
  time: string;
  thumbnailUrl: string;
  price: number;
};

const MOCK_LESSONS: MockLesson[] = [
  { id: 1, title: 'AIKI Class', time: '17:00-18:30', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360972448', price: 30000 },
  { id: 2, title: 'REDLIC Class', time: '17:00-18:30', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360582188', price: 25000 },
  { id: 3, title: 'BADA LEE Class', time: '19:00-20:30', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927', price: 35000 },
  { id: 4, title: 'EUNKI Class', time: '14:00-15:30', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360297269', price: 28000 },
  { id: 5, title: 'JIKANG Class', time: '10:00-11:30', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360753042', price: 22000 },
  { id: 6, title: 'DOPHAN Class', time: '20:00-21:30', thumbnailUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489', price: 27000 },
];

type KioskLessonListFormProps = {
  locale: Locale;
  onSelectLesson: (lesson: MockLesson) => void;
  onBack: () => void;
  onChangeLocale: (locale: Locale) => void;
};

export const KioskLessonListForm = ({ locale, onSelectLesson, onBack, onChangeLocale }: KioskLessonListFormProps) => {
  const [selectedDate] = useState('26년 4월 19일');

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 — 로고 + 언어/홈 */}
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onHome={onBack} />

      {/* 날짜 바 — Figma: 1080x100, padding 60/20, gap 12 */}
      <div className="shrink-0 flex items-center px-[5.6%]" style={{ gap: 'min(1.1vw, 12px)', paddingTop: 'min(1.85vw, 20px)', paddingBottom: 'min(1.85vw, 20px)' }}>
        <span className="text-black font-bold" style={{ fontSize: 'min(3.7vw, 40px)' }}>{selectedDate}</span>
        <div className="rounded-full bg-[#F2F4F6] flex items-center justify-center" style={{ width: 'min(4.8vw, 52px)', height: 'min(4.8vw, 52px)' }}>
          <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
            <path d="M2 2L12 12L22 2" stroke="#6D7882" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* 수업 그리드 — Figma: padding 40/20/40/20, card 325x526 r32, gap ~12px */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '1.04% 3.7%' }}>
        <div className="grid grid-cols-3" style={{ gap: '1.1%' }}>
          {MOCK_LESSONS.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className="relative aspect-[325/526] rounded-[min(3vw,32px)] overflow-hidden bg-[#E8E8EA] cursor-pointer active:scale-[0.97] transition-transform"
            >
              {lesson.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lesson.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

              {/* 하단 텍스트 — Figma: padding 20/24, gap 8 */}
              <div className="absolute bottom-0 left-0 right-0" style={{ padding: '1.85% 2.2% 2.2%' }}>
                <p className="text-white font-bold leading-snug line-clamp-2" style={{ fontSize: 'min(2.96vw, 32px)' }}>{lesson.title}</p>
                <p className="text-[#B1B8BE]" style={{ fontSize: 'min(2.6vw, 28px)', marginTop: 'min(0.74vw, 8px)' }}>{lesson.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── 공통 상단 바 ── */
const KIOSK_LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'jp', flag: '🇯🇵', label: '日本語' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
];

export const KioskTopBar = ({ locale, onChangeLocale, onHome }: {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  onHome: () => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const current = KIOSK_LOCALES.find(l => l.code === locale) ?? KIOSK_LOCALES[0];

  return (
    <div className="shrink-0 flex items-center justify-between px-[5.6%] py-[1%] h-[min(12vh,130px)]">
      {/* 로고 placeholder */}
      <div className="w-[min(5.6vw,60px)] h-[min(5.6vw,60px)] flex items-center justify-center">
        <svg width="20" height="34" viewBox="0 0 20 34" fill="none">
          <path d="M14 2L6 17L14 32" stroke="#1E2124" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="flex items-center gap-[min(2.2vw,24px)]">
        {/* 언어 선택 */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(v => !v)}
            className="h-[min(8.3vw,90px)] px-[min(2.2vw,24px)] rounded-[26px] bg-white border border-[#E8E8EA] flex items-center gap-[min(0.7vw,8px)] shadow-sm"
          >
            <span className="text-[min(3.3vw,36px)]">{current.flag}</span>
            <span className="text-[min(3vw,32px)] font-medium text-[#1E2124]">{current.label}</span>
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
              <path d="M2 2L10 10L18 2" stroke="#6D7882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showPicker && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-[#E8E8EA] rounded-[16px] shadow-lg z-30 overflow-hidden min-w-[180px]">
              {KIOSK_LOCALES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { onChangeLocale(l.code); setShowPicker(false); }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left active:bg-gray-100 ${l.code === locale ? 'bg-gray-50 font-bold' : ''}`}
                >
                  <span className="text-[24px]">{l.flag}</span>
                  <span className="text-[16px] text-[#1E2124]">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 홈 버튼 */}
        <button
          onClick={onHome}
          className="w-[min(5.6vw,60px)] h-[min(5.6vw,60px)] flex items-center justify-center"
        >
          <svg width="44" height="46" viewBox="0 0 44 46" fill="none">
            <path d="M6 20L22 6L38 20V40C38 41.1 37.1 42 36 42H8C6.9 42 6 41.1 6 40V20Z" stroke="#B1B8BE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 42V24H28V42" stroke="#B1B8BE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
