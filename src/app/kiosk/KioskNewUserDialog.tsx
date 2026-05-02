'use client';

import React, { useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type Props = {
  name: string;
  phone: string;
  locale: Locale;
  onConfirm: () => void;
  onCancel: () => void;
};

const formatPhone = (digits: string) => {
  const d = digits.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7, 11)}`;
};

export const KioskNewUserDialog = ({ name, phone, locale, onConfirm, onCancel }: Props) => {
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
      className={`fixed inset-0 z-40 bg-black/50 flex items-center justify-center px-[5%] ${
        closing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
    >
      <div
        className={`bg-white rounded-[28px] w-full max-w-[640px] p-[28px] flex flex-col ${
          closing ? 'animate-[scaleOut_200ms_ease-in_forwards]' : 'animate-[scaleIn_200ms_ease-out]'
        }`}
      >
        {/* 타이틀 */}
        <p className="text-black font-bold leading-snug" style={{ fontSize: 'min(2.4vh, 26px)' }}>
          {t('kiosk_new_user_title')}
        </p>
        <p className="text-black font-bold leading-snug mt-[4px]" style={{ fontSize: 'min(2vh, 22px)' }}>
          {t('kiosk_new_user_desc')}
        </p>

        {/* 유저 정보 카드 */}
        <div className="mt-[20px] bg-[#F9F9FB] rounded-[20px] p-[20px] flex items-center gap-[16px]">
          {/* 아바타 */}
          <div
            className="shrink-0 rounded-full bg-[#E6E8EA] flex items-center justify-center"
            style={{ width: 'min(7vw, 56px)', height: 'min(7vw, 56px)' }}
          >
            <span className="text-[#86898C] font-extrabold" style={{ fontSize: 'min(3vw, 24px)' }}>R</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-black font-bold truncate" style={{ fontSize: 'min(2vh, 22px)' }}>{name}</span>
            <span className="text-[#86898C] mt-[2px]" style={{ fontSize: 'min(1.6vh, 18px)' }}>{formatPhone(phone)}</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-[20px] flex gap-[10px]">
          <button
            onClick={() => close()}
            className="flex-[1] h-[min(6vh,56px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_cancel')}</span>
          </button>
          <button
            onClick={() => close({ confirm: true })}
            className="flex-[2] h-[min(6vh,56px)] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
