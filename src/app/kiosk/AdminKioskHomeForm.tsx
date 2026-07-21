'use client';

import React, {useRef, useState} from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';

const KIOSK_LOCALES: { code: Locale; flag: string; label: string }[] = [
  {code: 'ko', flag: '🇰🇷', label: '한국어'},
  {code: 'en', flag: '🇺🇸', label: 'English'},
  {code: 'jp', flag: '🇯🇵', label: '日本語'},
  {code: 'zh', flag: '🇨🇳', label: '中文'},
];

type AdminKioskHomeFormProps = {
  studioName: string;
  kioskName?: string;
  locale: Locale;
  canCheckIn: boolean;
  canPurchase: boolean;
  onSelectPayment: () => void;
  onSelectVisit: () => void;
  onSelectLessonAttendance: () => void;
  onChangeLocale: (locale: Locale) => void;
  onAdminMode: () => void;
};

// 상담실 태블릿(admin) 홈 — 직원이 회원을 앞에 앉혀놓고 진행하는 UI.
// 무인 키오스크(KioskHomeForm)와 달리 큰 이미지 없이, 인사 문구 + 액션 카드 그리드로 구성.
export const AdminKioskHomeForm = ({
  studioName,
  kioskName,
  locale,
  canCheckIn,
  canPurchase,
  onSelectPayment,
  onSelectVisit,
  onSelectLessonAttendance,
  onChangeLocale,
  onAdminMode,
}: AdminKioskHomeFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const currentLocale = KIOSK_LOCALES.find((l) => l.code === locale) ?? KIOSK_LOCALES[0];

  // 스튜디오명 5번 연속 탭 → 관리자 모드 (무인 홈과 동일 제스처)
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSecretTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onAdminMode();
      return;
    }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 1500);
  };

  const cards = [
    {
      key: 'lesson',
      show: true,
      onClick: onSelectLessonAttendance,
      title: t('kiosk_lesson_attendance_title'),
      desc: t('kiosk_admin_card_lesson_desc'),
      icon: '/assets/ic_kiosk_attendance.svg',
      dark: false,
    },
    {
      key: 'studio',
      show: canCheckIn,
      onClick: onSelectVisit,
      title: t('kiosk_admin_studio_attendance'),
      desc: t('kiosk_admin_card_studio_desc'),
      icon: '/assets/ic_kiosk_attendance.svg',
      dark: false,
    },
    {
      key: 'payment',
      show: canPurchase,
      onClick: onSelectPayment,
      title: t('kiosk_payment_title'),
      desc: t('kiosk_admin_card_payment_desc'),
      icon: '/assets/ic_kiosk_card.svg',
      dark: true,
    },
  ].filter((c) => c.show);

  return (
    <div className="bg-[#F7F8FA] w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 */}
      <div className="h-[84px] shrink-0 px-[48px] flex items-center justify-between border-b border-[#EDEFF2] bg-white">
        <button onClick={handleSecretTap} className="flex items-center gap-[12px] active:opacity-70 transition-opacity">
          <span className="text-[#1E2124] text-[22px] font-bold">{studioName}</span>
          {kioskName && (
            <span className="px-[12px] py-[5px] rounded-full bg-[#F2F4F6] text-[#6D7882] text-[15px] font-medium">
              {kioskName}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowLocalePicker((v) => !v)}
            className="h-[44px] px-[16px] rounded-[12px] bg-white border border-[#E6E8EA] flex items-center gap-[8px] shadow-sm active:scale-[0.97] transition-transform"
          >
            <span className="text-[20px]">{currentLocale.flag}</span>
            <span className="text-[16px] font-medium text-[#1E2124]">{currentLocale.label}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showLocalePicker && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-[#E8E8EA] rounded-[16px] shadow-lg z-20 overflow-hidden min-w-[160px]">
              {KIOSK_LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { onChangeLocale(l.code); setShowLocalePicker(false); }}
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

      {/* 본문 — 인사 + 액션 카드 */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-[56px]">
        <p className="text-[#1E2124] text-[40px] font-bold tracking-[-1px] text-center">
          {t('kiosk_admin_greeting')}
        </p>
        <p className="text-[#8A949E] text-[20px] mt-[12px] mb-[48px] text-center">
          {t('kiosk_admin_subtitle')}
        </p>

        <div
          className="w-full grid gap-[20px]"
          style={{gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`, maxWidth: cards.length === 1 ? 420 : cards.length === 2 ? 800 : 1120}}
        >
          {cards.map((card) => (
            <button
              key={card.key}
              onClick={card.onClick}
              className={`flex flex-col items-start gap-[20px] rounded-[28px] p-[32px] text-left active:scale-[0.98] transition-transform ${
                card.dark ? 'bg-[#1E2124]' : 'bg-white border border-[#EDEFF2]'
              }`}
              style={{minHeight: 260}}
            >
              <div className={`w-[72px] h-[72px] rounded-[20px] flex items-center justify-center ${card.dark ? 'bg-white/10' : 'bg-[#F2F4F6]'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.icon} alt="" width={40} height={40} className={`block ${card.dark ? 'brightness-0 invert' : ''}`}/>
              </div>
              <div className="flex flex-col gap-[8px]">
                <span className={`text-[28px] font-bold leading-tight ${card.dark ? 'text-white' : 'text-[#1E2124]'}`}>
                  {card.title}
                </span>
                <span className={`text-[17px] leading-snug ${card.dark ? 'text-white/60' : 'text-[#8A949E]'}`}>
                  {card.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
