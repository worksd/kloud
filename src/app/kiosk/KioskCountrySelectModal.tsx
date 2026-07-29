'use client';

import React, { useState } from 'react';
import { COUNTRIES, getCountryName } from '@/app/certification/COUNTRIES';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type Props = {
  selectedKey: string;
  locale: Locale;
  onConfirm: (key: string) => void;
  onCancel: () => void;
};

export const KioskCountrySelectModal = ({ selectedKey, locale, onConfirm, onCancel }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [closing, setClosing] = useState(false);
  const [pickedKey, setPickedKey] = useState<string>(selectedKey);

  const close = (next?: { confirm?: boolean }) => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      if (next?.confirm) onConfirm(pickedKey);
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
        className={`bg-white rounded-[28px] w-full max-w-[640px] max-h-[80vh] flex flex-col overflow-hidden ${
          closing ? 'animate-[scaleOut_200ms_ease-in_forwards]' : 'animate-[scaleIn_200ms_ease-out]'
        }`}
      >
        {/* 타이틀 */}
        <div className="shrink-0 px-[24px] pt-[24px] pb-[16px]">
          <p className="text-black font-bold" style={{ fontSize: 'min(2.4vh, 26px)' }}>
            {t('kiosk_country_select')}
          </p>
        </div>

        {/* 국가 리스트 */}
        <div className="flex-1 overflow-y-auto px-[16px]">
          <div className="bg-[#F9F9FB] rounded-[16px] py-[6px]">
            {COUNTRIES.map((c) => {
              const selected = c.key === pickedKey;
              return (
                <button
                  key={c.key}
                  onClick={() => setPickedKey(c.key)}
                  className="w-full flex items-center gap-[12px] px-[16px] py-[12px] active:bg-black/5 transition-colors"
                >
                  <span className="text-[20px]" style={{ lineHeight: 1 }}>{c.flag}</span>
                  <span
                    className={`flex-1 text-left ${selected ? 'font-bold text-[#1E2124]' : 'text-[#1E2124]'}`}
                    style={{ fontSize: 'min(1.7vh, 18px)' }}
                  >
                    {getCountryName(c, locale)}
                  </span>
                  {selected && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12L10 17L19 7" stroke="#1E2124" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="shrink-0 px-[24px] py-[16px] flex gap-[10px]">
          <button
            onClick={() => close()}
            className="flex-1 h-[min(6vh,52px)] rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.7vh, 18px)' }}>{t('kiosk_cancel')}</span>
          </button>
          <button
            onClick={() => close({ confirm: true })}
            className="flex-[2] h-[min(6vh,52px)] rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(1.7vh, 18px)' }}>{t('kiosk_confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
