'use client';

import React, { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// 비회원(게스트) 연습실 결제 — 결제하기 시 예약자 phone/name 입력 바텀시트.
// 확인 시 { phone, name } 을 반환하면 상위에서 customData에 실어 결제 진행.
export const GuestInfoBottomSheet = ({
  locale,
  onConfirm,
  onClose,
}: {
  locale: Locale;
  onConfirm: (info: { phone: string; name: string }) => void;
  onClose: () => void;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [closing, setClosing] = useState(false);

  const close = (after?: () => void) => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => { after?.(); onClose(); }, 200);
  };

  const digits = phone.replace(/\D/g, '');
  const valid = name.trim().length > 0 && digits.length >= 9;

  return (
    <div className={`fixed inset-0 z-[60] flex items-end ${closing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_180ms_ease-out]'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => close()} />
      <div className={`relative w-full bg-white rounded-t-3xl px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] ${closing ? 'animate-[slideDown_220ms_ease-in_forwards]' : 'animate-[slideUp_220ms_ease-out]'}`}>
        <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mb-4" />

        <p className="text-[18px] font-bold text-[#171717]">{t('guest_info_title')}</p>
        <p className="mt-1 text-[13px] text-[#86898C] leading-snug">{t('guest_info_desc')}</p>

        <div className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#4E5968]">{t('guest_name_label')}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('guest_name_placeholder')}
              className="h-12 rounded-xl bg-[#F1F3F6] px-4 text-[15px] text-[#171717] placeholder:text-[#A0A5AB] outline-none focus:ring-2 focus:ring-[#171717]/10"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#4E5968]">{t('guest_phone_label')}</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              type="tel"
              placeholder={t('guest_phone_placeholder')}
              className="h-12 rounded-xl bg-[#F1F3F6] px-4 text-[15px] text-[#171717] placeholder:text-[#A0A5AB] outline-none focus:ring-2 focus:ring-[#171717]/10"
            />
          </label>
        </div>

        <button
          disabled={!valid}
          onClick={() => close(() => onConfirm({ phone: digits, name: name.trim() }))}
          className={`mt-5 w-full h-14 rounded-2xl flex items-center justify-center transition-transform ${valid ? 'bg-[#171717] active:scale-[0.98]' : 'bg-[#E0E0E0] cursor-not-allowed'}`}
        >
          <span className={`text-[16px] font-bold ${valid ? 'text-white' : 'text-[#999]'}`}>{t('confirm')}</span>
        </button>
      </div>
    </div>
  );
};
