'use client';

import React, {useState} from 'react';
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";

const KIOSK_LOCALES: { code: Locale; flag: string; label: string }[] = [
  {code: 'ko', flag: '🇰🇷', label: '한국어'},
  {code: 'en', flag: '🇺🇸', label: 'English'},
  {code: 'jp', flag: '🇯🇵', label: '日本語'},
  {code: 'zh', flag: '🇨🇳', label: '中文'},
];

type KioskHomeFormProps = {
  studioName: string;
  kioskImageUrl?: string;
  locale: Locale;
  onSelectPayment: () => void;
  onSelectVisit: () => void;
  onChangeLocale: (locale: Locale) => void;
};

export const KioskHomeForm = ({studioName, kioskImageUrl, locale, onSelectPayment, onSelectVisit, onChangeLocale}: KioskHomeFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const currentLocale = KIOSK_LOCALES.find((l) => l.code === locale) ?? KIOSK_LOCALES[0];

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden relative">
      {/* 키오스크 이미지 영역 — 68.6% */}
      <div className="flex-[686] min-h-0">
        {kioskImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kioskImageUrl} alt="" className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full bg-[#F9F9FB]"/>
        )}
      </div>

      {/* 로고 + 언어 선택 바 — 7.8% */}
      <div className="flex-[78] shrink-0 flex items-center justify-between px-[5.6%] relative">
        {/* 로고 텍스트 */}
        <span className="text-black text-[1.4vw] font-bold tracking-tight" style={{fontFamily: 'SF Pro Text, system-ui, sans-serif'}}>
          {studioName}
        </span>

        {/* 언어 드롭다운 */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowLocalePicker((v) => !v)}
            className="h-[min(5vh,56px)] px-[1.8vw] rounded-[20px] bg-white border border-[#E8E8EA] flex items-center gap-[0.7vw] shadow-sm"
          >
            <span className="text-[min(2.5vh,28px)]">{currentLocale.flag}</span>
            <span className="text-[min(2vh,24px)] font-medium text-[#1E2124]">{currentLocale.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-[min(1.2vh,14px)] h-[min(1.2vh,14px)]">
              <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showLocalePicker && (
            <div className="absolute bottom-full mb-2 right-0 bg-white border border-[#E8E8EA] rounded-[16px] shadow-lg z-20 overflow-hidden min-w-[160px]">
              {KIOSK_LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onChangeLocale(l.code);
                    setShowLocalePicker(false);
                  }}
                  className={`w-full px-[16px] py-[14px] flex items-center gap-[12px] text-left hover:bg-gray-50 active:bg-gray-100 ${l.code === locale ? 'bg-gray-50 font-bold' : ''}`}
                >
                  <span className="text-[24px]">{l.flag}</span>
                  <span className="text-[16px] text-[#1E2124]">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 카드 영역 — 23.5% */}
      <div className="flex-[235] shrink-0 flex gap-[2.9%] px-[5.6%] pt-[3.1%] pb-[1%]">
        {/* 출석 체크 — 34.5% */}
        <div
          onClick={onSelectVisit}
          className="flex-[345] flex flex-col justify-between bg-[#F2F4F6] rounded-[32px] p-[24px] cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="w-[min(6vh,80px)] h-[min(6vh,80px)] rounded-full bg-white flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M9 11L12 14L22 4" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[#1E2124] text-[min(4vh,52px)] font-bold leading-tight mt-[20px]">
            {t('kiosk_visit_title')}
          </span>
        </div>

        {/* 수업 결제 — 65.5% */}
        <div
          onClick={onSelectPayment}
          className="flex-[655] flex flex-col justify-between bg-[#1E2124] rounded-[32px] p-[24px] cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="w-[min(6vh,80px)] h-[min(6vh,80px)] rounded-full bg-white flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="#1E2124" strokeWidth="1.8"/>
              <path d="M2 10H22" stroke="#1E2124" strokeWidth="1.8"/>
              <path d="M6 15H10" stroke="#1E2124" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white text-[min(4vh,52px)] font-bold leading-tight mt-[20px]">
            {t('kiosk_payment_title')}
          </span>
        </div>
      </div>
    </div>
  );
};
