'use client';

import React, { useState } from 'react';
import { Locale } from '@/shared/StringResource';

// 키오스크 전 스텝 공통 상단 바 규격.
// 좌: 뒤로가기(옵션) · 중앙: 타이틀(옵션) · 우: 언어 선택 + 홈(옵션).
// 높이/패딩/폰트/아이콘 크기를 한 규격으로 통일 — 스텝마다 헤더가 달라 보이지 않도록.
export const KIOSK_LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'jp', flag: '🇯🇵', label: '日本語' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
];

export const KioskTopBar = ({ title, locale, onChangeLocale, onBack, onHome, hideLocale }: {
  title?: string;
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  onBack?: () => void;
  onHome?: () => void;
  hideLocale?: boolean; // admin 모드 등에서 언어 선택 숨김
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const current = KIOSK_LOCALES.find(l => l.code === locale) ?? KIOSK_LOCALES[0];

  return (
    <div className="relative shrink-0 flex items-center justify-between pr-[5.6%] h-[min(7vh,72px)]">
      {/* 좌측 — 뒤로가기 (없으면 빈 공간, 타이틀은 절대중앙이라 유지됨) */}
      {onBack ? (
        <button
          onClick={onBack}
          className="ml-[min(1.6vw,18px)] w-[min(5.6vh,64px)] h-[min(5.6vh,64px)] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ic_back_arrow.svg" alt="" className="w-[min(4.4vh,48px)] h-[min(4.4vh,48px)]" />
        </button>
      ) : (
        <span className="ml-[min(1.6vw,18px)] w-[min(5.6vh,64px)]" />
      )}

      {/* 중앙 — 타이틀 */}
      {title && (
        <p className="absolute left-1/2 -translate-x-1/2 text-[#1E2124] text-[min(2.6vh,26px)] font-bold pointer-events-none whitespace-nowrap">
          {title}
        </p>
      )}

      {/* 우측 — 언어 선택 + 홈 */}
      <div className="flex items-center gap-[min(1.5vw,16px)]">
        {!hideLocale && (
        <div className="relative">
          <button
            onClick={() => setShowPicker(v => !v)}
            className="h-[min(4vh,44px)] px-[1.8vw] rounded-[12px] bg-white border border-[#E6E8EA] flex items-center gap-[0.7vw] shadow-sm active:scale-[0.97] transition-transform"
          >
            <span className="text-[min(2vh,22px)]">{current.flag}</span>
            <span className="text-[min(1.6vh,18px)] font-medium text-[#1E2124]">{current.label}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-[min(1.8vh,20px)] h-[min(1.8vh,20px)]">
              <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showPicker && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-[#E6E8EA] rounded-[16px] shadow-lg z-30 overflow-hidden min-w-[180px]">
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
        )}

        {onHome && (
          <button
            onClick={onHome}
            className="w-[min(4vh,44px)] h-[min(4vh,44px)] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <svg viewBox="0 0 44 46" fill="none" className="w-[min(2.4vh,26px)] h-[min(2.4vh,26px)]">
              <path d="M6 20L22 6L38 20V40C38 41.1 37.1 42 36 42H8C6.9 42 6 41.1 6 40V20Z" stroke="#B1B8BE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 42V24H28V42" stroke="#B1B8BE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
