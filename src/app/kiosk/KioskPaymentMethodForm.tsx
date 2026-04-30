'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";

type KioskPaymentMethodFormProps = {
  lessonTitle: string;
  price: number;
  locale: Locale;
  onBack: () => void;
  onSelectPass: () => void;
  onSelectCard: () => void;
  onSelectApplePay: () => void;
  onSelectCash: () => void;
  onHome: () => void;
  onChangeLocale: (locale: Locale) => void;
};

export const KioskPaymentMethodForm = ({
  lessonTitle,
  price,
  locale,
  onBack,
  onSelectPass,
  onSelectCard,
  onSelectApplePay,
  onSelectCash,
  onHome,
  onChangeLocale,
}: KioskPaymentMethodFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 */}
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onHome} />

      {/* 큰 안내 문구 — 가운데 정렬, 위쪽 큰 여백 */}
      <div className="shrink-0 flex items-center justify-center px-[5.6%]" style={{ paddingTop: 'min(20vw, 220px)', paddingBottom: 'min(8vw, 80px)' }}>
        <p className="text-black font-bold text-center leading-tight" style={{ fontSize: 'min(3.4vw, 36px)' }}>
          {t('kiosk_how_to_pay')}
        </p>
      </div>

      {/* 결제 금액 바 */}
      <div className="shrink-0 px-[5.6%] pb-[min(1.4vw,16px)]">
        <div className="flex items-center justify-between rounded-[16px] px-[min(3.7vw,40px)] py-[min(2.6vw,28px)]" style={{ backgroundColor: '#F9F9FB' }}>
          <span className="text-black" style={{ fontSize: 'min(2.4vw, 26px)' }}>{t('payment_amount')}</span>
          <span className="flex items-baseline gap-[8px]">
            <span className="text-black font-bold" style={{ fontSize: 'min(3.6vw, 38px)' }}>{fmt(price)}</span>
            <span className="text-[#86898C]" style={{ fontSize: 'min(2vw, 22px)' }}>{t('won')}</span>
          </span>
        </div>
      </div>

      {/* 결제 수단 카드 4개 */}
      <div className="shrink-0 grid grid-cols-4 gap-[min(1.4vw,16px)] px-[5.6%] pb-[min(1.4vw,16px)]">
        {/* 패스권 */}
        <button
          onClick={onSelectPass}
          className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
        >
          <svg width="36" height="28" viewBox="0 0 72 54" fill="none">
            <rect x="2" y="2" width="68" height="50" rx="8" fill="#A6B5C9"/>
            <path d="M36 14L38.4 19L43.5 19.5L39.5 23L40.5 28.5L36 26L31.5 28.5L32.5 23L28.5 19.5L33.6 19L36 14Z" fill="white"/>
          </svg>
          <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2vw, 22px)' }}>
            {t('kiosk_pass')}
          </span>
        </button>

        {/* 신용/체크 카드 */}
        <button
          onClick={onSelectCard}
          className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
        >
          <svg width="28" height="38" viewBox="0 0 54 70" fill="none">
            <rect x="2" y="2" width="50" height="66" rx="8" fill="#A6B5C9"/>
            <circle cx="42" cy="14" r="3.5" fill="white"/>
          </svg>
          <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2vw, 22px)' }}>
            {t('kiosk_card')}
          </span>
        </button>

        {/* Apple Pay */}
        <button
          onClick={onSelectApplePay}
          className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
        >
          <svg width="32" height="40" viewBox="0 0 54 70" fill="none">
            <rect x="2" y="2" width="50" height="66" rx="8" fill="#A6B5C9"/>
            <path d="M30.5 35.5C29.2 35.5 27.9 36.4 26.8 36.4C25.7 36.4 24.5 35.5 23 35.5C20.5 35.5 17.5 37.5 17.5 41.8C17.5 44.7 18.7 47.7 20.3 49.7C21.1 50.7 22 51.6 23.1 51.6C24.2 51.6 24.6 50.9 25.9 50.9C27.2 50.9 27.7 51.6 28.8 51.6C29.9 51.6 30.7 50.6 31.5 49.7C32.4 48.5 32.8 47.4 32.8 47.3C32.7 47.2 30.7 46.4 30.7 44C30.7 42 32.3 41 32.4 40.9C31.6 39.7 30.4 35.5 30.5 35.5Z" fill="white"/>
            <path d="M28.7 33.5C29.3 32.7 29.7 31.6 29.6 30.5C28.7 30.5 27.6 31.1 26.9 31.9C26.4 32.6 25.9 33.7 26 34.8C27 34.9 28 34.3 28.7 33.5Z" fill="white"/>
          </svg>
          <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2vw, 22px)' }}>
            Apple Pay
          </span>
        </button>

        {/* 현금 */}
        <button
          onClick={onSelectCash}
          className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
        >
          <svg width="36" height="28" viewBox="0 0 72 54" fill="none">
            <rect x="2" y="2" width="68" height="50" rx="8" fill="#A6B5C9"/>
            <circle cx="36" cy="27" r="9" fill="none" stroke="white" strokeWidth="2.5"/>
            <rect x="10" y="13" width="6" height="3" rx="1" fill="white"/>
            <rect x="56" y="13" width="6" height="3" rx="1" fill="white"/>
            <rect x="10" y="38" width="6" height="3" rx="1" fill="white"/>
            <rect x="56" y="38" width="6" height="3" rx="1" fill="white"/>
          </svg>
          <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2vw, 22px)' }}>
            현금
          </span>
        </button>
      </div>

      {/* 하단 이전 버튼 — Figma: 짧고 wide */}
      <div className="mt-auto shrink-0 px-[5.6%] pt-[min(1.8vw,20px)] pb-[min(2.8vw,30px)]">
        <button
          onClick={onBack}
          className="w-full h-[min(7vh,72px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vw, 26px)' }}>{t('kiosk_back')}</span>
        </button>
      </div>
    </div>
  );
};
