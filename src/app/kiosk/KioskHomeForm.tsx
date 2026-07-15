'use client';

import React, {useRef, useState} from 'react';
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
  canCheckIn: boolean;
  canPurchase: boolean;
  onSelectPayment: () => void;
  onSelectVisit: () => void;
  onReserveRoom: () => void;
  onChangeLocale: (locale: Locale) => void;
  onAdminMode: () => void;
};

export const KioskHomeForm = ({studioName, kioskImageUrl, locale, canCheckIn, canPurchase, onSelectPayment, onSelectVisit, onReserveRoom, onChangeLocale, onAdminMode}: KioskHomeFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const currentLocale = KIOSK_LOCALES.find((l) => l.code === locale) ?? KIOSK_LOCALES[0];

  // 로우그래피 로고 5번 연속 탭 → 관리자 모드 진입 (1.5초 안에 5번)
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLogoTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onAdminMode();
      return;
    }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 1500);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden relative">
      {/* 키오스크 이미지 영역 */}
      <div className="flex-[650] min-h-0">
        {kioskImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kioskImageUrl} alt="" className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full bg-[#F9F9FB]"/>
        )}
      </div>

      {/* 카드 영역 — canCheckIn/canPurchase 플래그에 따라 노출. 둘 다 false면 row 자체를 숨김.
          연습실 예약은 결제와 동일하게 canPurchase로 게이팅. */}
      {(canCheckIn || canPurchase) && (
        <div className="flex-[200] shrink-0 flex gap-[2.9%] px-[5.6%] pt-[3.1%] pb-[2%]">
          {canCheckIn && (
            <div
              onClick={onSelectVisit}
              className="flex-1 flex flex-col items-center justify-center gap-[min(2.6vh,28px)] bg-[#F2F4F6] rounded-[32px] p-[24px] cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/ic_kiosk_attendance.svg" alt="" width={48} height={48} className="flex-shrink-0 block"/>
              <span className="text-[#1E2124] text-[min(2.4vh,32px)] font-bold leading-tight">
                {t('kiosk_visit_title')}
              </span>
            </div>
          )}

          {canPurchase && (
            <div
              onClick={onReserveRoom}
              className="flex-1 flex flex-col items-center justify-center gap-[min(2.6vh,28px)] bg-[#F2F4F6] rounded-[32px] p-[24px] cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/ic_kiosk_attendance.svg" alt="" width={48} height={48} className="flex-shrink-0 block"/>
              <span className="text-[#1E2124] text-[min(2.4vh,32px)] font-bold leading-tight">
                {t('kiosk_reserve_room')}
              </span>
            </div>
          )}

          {canPurchase && (
            <div
              onClick={onSelectPayment}
              className="flex-1 flex flex-col items-center justify-center gap-[min(2.6vh,28px)] bg-[#1E2124] rounded-[32px] p-[24px] cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/ic_kiosk_card.svg" alt="" width={48} height={48} className="flex-shrink-0 block"/>
              <span className="text-white text-[min(2.4vh,32px)] font-bold leading-tight">
                {t('kiosk_payment_title')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 푸터 — rawgraphy 로고 + 언어 피커 */}
      <div className="flex-[80] shrink-0 flex items-center justify-between px-[5.6%] relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo_black.svg"
          alt="rawgraphy"
          height={14}
          className="h-[min(1.4vh,14px)] w-auto block cursor-pointer"
          onClick={handleLogoTap}
        />

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowLocalePicker((v) => !v)}
            className="h-[min(4vh,44px)] px-[1.8vw] rounded-[12px] bg-white border border-[#E6E8EA] flex items-center gap-[0.7vw] shadow-sm active:scale-[0.97] transition-transform"
          >
            <span className="text-[min(2vh,22px)]">{currentLocale.flag}</span>
            <span className="text-[min(1.6vh,18px)] font-medium text-[#1E2124]">{currentLocale.label}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-[min(1.8vh,20px)] h-[min(1.8vh,20px)]">
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
    </div>
  );
};
