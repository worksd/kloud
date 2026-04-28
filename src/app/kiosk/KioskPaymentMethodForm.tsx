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
  onHome,
  onChangeLocale,
}: KioskPaymentMethodFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 */}
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onHome} />

      {/* 큰 안내 문구 — 가운데 정렬 */}
      <div className="shrink-0 flex items-center justify-center px-[5.6%]" style={{ paddingTop: 'min(8vw, 80px)', paddingBottom: 'min(4vw, 40px)' }}>
        <p className="text-black font-bold text-center leading-tight" style={{ fontSize: 'min(4vw, 44px)' }}>
          {t('kiosk_how_to_pay')}
        </p>
      </div>

      {/* 결제 금액 바 */}
      <div className="shrink-0 px-[5.6%] py-[min(1.8vw,20px)]">
        <div className="flex items-center justify-between rounded-[24px] px-[min(3.7vw,40px)] py-[min(2.4vw,28px)]" style={{ backgroundColor: '#F9F9FB' }}>
          <span className="text-[#86898C]" style={{ fontSize: 'min(2vw, 22px)' }}>{t('payment_amount')}</span>
          <span className="text-black font-bold" style={{ fontSize: 'min(3vw, 32px)' }}>
            {fmt(price)}<span className="font-normal ml-[6px]" style={{ fontSize: 'min(2vw, 22px)' }}>{t('won')}</span>
          </span>
        </div>
      </div>

      {/* 결제 수단 카드 2개 — Figma: 464x440 each, gap 32, p60/20 */}
      <div className="flex-1 flex gap-[min(2.9vw,32px)] px-[5.6%] py-[min(1.8vw,20px)]">
        {/* 패스권 */}
        <div
          onClick={onSelectPass}
          className="flex-1 flex flex-col bg-[#F9F9FB] rounded-[32px] p-[min(2.2vw,24px)] cursor-pointer active:scale-[0.97] transition-transform"
        >
          <div className="w-[min(7.4vw,80px)] h-[min(7.4vw,80px)] rounded-full bg-white flex items-center justify-center">
            <svg width="40" height="30" viewBox="0 0 72 54" fill="none">
              <rect x="2" y="2" width="68" height="50" rx="8" stroke="#A6B5C9" strokeWidth="4"/>
              <path d="M2 16H70" stroke="#A6B5C9" strokeWidth="4"/>
              <path d="M14 30H32" stroke="#A6B5C9" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[#1E2124] font-bold mt-[min(1.8vw,20px)]" style={{ fontSize: 'min(4.8vw, 52px)' }}>
            {t('kiosk_pass')}
          </span>
        </div>

        {/* 신용/체크 카드 */}
        <div
          onClick={onSelectCard}
          className="flex-1 flex flex-col bg-[#F9F9FB] rounded-[32px] p-[min(2.2vw,24px)] cursor-pointer active:scale-[0.97] transition-transform"
        >
          <div className="w-[min(7.4vw,80px)] h-[min(7.4vw,80px)] rounded-full bg-white flex items-center justify-center">
            <svg width="30" height="40" viewBox="0 0 54 70" fill="none">
              <rect x="2" y="2" width="50" height="66" rx="6" stroke="#1E2124" strokeWidth="3.5"/>
              <circle cx="27" cy="50" r="5" stroke="#1E2124" strokeWidth="3"/>
              <path d="M17 12H37" stroke="#1E2124" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[#1E2124] font-bold mt-[min(1.8vw,20px)]" style={{ fontSize: 'min(4.8vw, 52px)' }}>
            {t('kiosk_card')}
          </span>
        </div>
      </div>

      {/* 하단 이전 버튼 — Figma: full width gray */}
      <div className="shrink-0 px-[min(4vw,44px)] pt-[min(2.9vw,32px)] pb-[min(4.4vw,48px)]">
        <button
          onClick={onBack}
          className="w-full h-[min(13.9vw,150px)] rounded-[32px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(4.2vw, 45px)' }}>{t('kiosk_back')}</span>
        </button>
      </div>
    </div>
  );
};
