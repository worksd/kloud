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

      {/* 결제 수단 카드 2개 */}
      <div className="shrink-0 flex gap-[min(1.4vw,16px)] px-[5.6%] pb-[min(1.4vw,16px)]">
        {/* 패스권 */}
        <button
          onClick={onSelectPass}
          className="flex-1 aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
        >
          <svg width="36" height="28" viewBox="0 0 72 54" fill="none">
            <rect x="2" y="2" width="68" height="50" rx="8" fill="#A6B5C9"/>
            <path d="M36 14L38.4 19L43.5 19.5L39.5 23L40.5 28.5L36 26L31.5 28.5L32.5 23L28.5 19.5L33.6 19L36 14Z" fill="white"/>
          </svg>
          <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.4vw, 26px)' }}>
            {t('kiosk_pass')}
          </span>
        </button>

        {/* 신용/체크 카드 */}
        <button
          onClick={onSelectCard}
          className="flex-1 aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
        >
          <svg width="28" height="38" viewBox="0 0 54 70" fill="none">
            <rect x="2" y="2" width="50" height="66" rx="8" fill="#A6B5C9"/>
            <circle cx="42" cy="14" r="3.5" fill="white"/>
          </svg>
          <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.4vw, 26px)' }}>
            {t('kiosk_card')}
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
