'use client';

import React, { useState } from 'react';
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { PassPlanBenefits } from "@/app/payment/PassPlanBenefits";

type Props = {
  passPlan: GetPassPlanResponse;
  locale: Locale;
  onClose: () => void;
  onPay: () => void;
};

export const KioskPassPlanDetailModal = ({ passPlan, locale, onClose, onPay }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onClose(), 200);
  };
  const pay = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onPay(), 200);
  };

  return (
    <div className={`fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%] ${closing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_200ms_ease-out]'}`}>
      <div className={`bg-white rounded-[24px] w-full max-w-[640px] max-h-[88vh] flex flex-col overflow-hidden ${closing ? 'animate-[scaleOut_200ms_ease-in_forwards]' : 'animate-[scaleIn_200ms_ease-out]'}`}>
        {/* 헤더 */}
        <div className="flex items-start justify-between px-[24px] pt-[24px] pb-[12px]">
          <div className="flex flex-col gap-[6px] min-w-0">
            <p className="text-black font-bold leading-snug" style={{ fontSize: 'min(2.2vh, 24px)' }}>{passPlan.name}</p>
            {passPlan.expireDateStamp && (
              <p className="text-[#86898C]" style={{ fontSize: 'min(1.4vh, 14px)' }}>{passPlan.expireDateStamp}</p>
            )}
          </div>
          <button
            onClick={close}
            className="shrink-0 w-[36px] h-[36px] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="#1E2124" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 본문 — rule/feature 별 아이콘 + 문구 */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[12px]">
          <PassPlanBenefits passPlan={passPlan} locale={locale} />
        </div>

        {/* 가격 */}
        <div className="shrink-0 px-[24px] pt-[12px] pb-[16px]">
          <span className="text-black font-extrabold" style={{ fontSize: 'min(2.4vh, 28px)' }}>
            {fmt(passPlan.price ?? 0)}{t('won')}
          </span>
        </div>

        {/* 하단 버튼 — 이전 / 패스권 구매 */}
        <div className="shrink-0 px-[24px] pb-[20px] flex gap-[10px]">
          <button
            onClick={close}
            className="flex-[1] h-[min(6vh,56px)] rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_back')}</span>
          </button>
          <button
            onClick={pay}
            className="flex-[2] h-[min(6vh,56px)] rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_buy_passplan')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
