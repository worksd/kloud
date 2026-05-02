'use client';

import React, { useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type Props = {
  amount: number;
  locale: Locale;
  onConfirm: () => void;
  onCancel: () => void;
};

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

export const KioskCashConfirmDialog = ({ amount, locale, onConfirm, onCancel }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [closing, setClosing] = useState(false);

  const close = (next?: { confirm?: boolean }) => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      if (next?.confirm) onConfirm();
      else onCancel();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[55] bg-black/50 flex items-center justify-center px-[5%] ${
        closing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
    >
      <div
        className={`bg-white rounded-[28px] w-full max-w-[680px] flex flex-col ${
          closing ? 'animate-[scaleOut_200ms_ease-in_forwards]' : 'animate-[scaleIn_200ms_ease-out]'
        }`}
        style={{ padding: 'min(4vw,44px) min(4vw,44px) min(3vw,32px)' }}
      >
        {/* 아이콘 */}
        <div className="self-center mb-[min(2vw,22px)] rounded-full bg-[#FFF4E0] flex items-center justify-center" style={{ width: 'min(7vw,72px)', height: 'min(7vw,72px)' }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: '50%', height: '50%' }}>
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="#E5A53A" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2.5" stroke="#E5A53A" strokeWidth="2"/>
          </svg>
        </div>

        {/* 타이틀 */}
        <p className="text-black font-bold text-center leading-snug" style={{ fontSize: 'min(3vw, 32px)' }}>
          {t('kiosk_cash_confirm_title_l1')}<br/>{t('kiosk_cash_confirm_title_l2')}
        </p>

        {/* 안내 */}
        <p className="text-[#6D7882] text-center mt-[min(1.4vw,16px)] leading-relaxed whitespace-pre-line" style={{ fontSize: 'min(1.8vw, 20px)' }}>
          {t('kiosk_cash_confirm_desc')}
        </p>

        {/* 결제 금액 */}
        <div className="mt-[min(2.4vw,26px)] bg-[#F9F9FB] rounded-[20px] flex items-center justify-between px-[min(3vw,32px)] py-[min(2vw,22px)]">
          <span className="text-[#6D7882]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('payment_amount')}</span>
          <span className="flex items-baseline" style={{ gap: 'min(0.4vw,6px)' }}>
            <span className="text-black font-bold" style={{ fontSize: 'min(3vw, 32px)' }}>{fmt(amount)}</span>
            <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('won')}</span>
          </span>
        </div>

        {/* 버튼 */}
        <div className="mt-[min(2.4vw,26px)] flex" style={{ gap: 'min(1vw,12px)' }}>
          <button
            onClick={() => close()}
            className="flex-[1] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
            style={{ height: 'min(7vw,76px)' }}
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.2vw, 24px)' }}>{t('kiosk_cancel')}</span>
          </button>
          <button
            onClick={() => close({ confirm: true })}
            className="flex-[2] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            style={{ height: 'min(7vw,76px)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(2.2vw, 24px)' }}>{t('kiosk_submit')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
