'use client';

import React, {useState} from 'react';
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
  onSelectPayment: () => void;
  onSelectVisit: () => void;
  onChangeLocale: (locale: Locale) => void;
};

export const KioskHomeForm = ({studioName, kioskImageUrl, locale, onSelectPayment, onSelectVisit, onChangeLocale}: KioskHomeFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const [showLocalePicker, setShowLocalePicker] = useState(false);
  const currentLocale = KIOSK_LOCALES.find((l) => l.code === locale) ?? KIOSK_LOCALES[0];

  return (
      <div className="bg-white w-full h-screen flex flex-col overflow-hidden relative">
        {/* 키오스크 이미지 */}
        {kioskImageUrl && (
            <div className="flex-1 min-h-0">
              <img src={kioskImageUrl} alt="" className="w-full h-full object-cover"/>
            </div>
        )}

        {/* 하단 영역 */}
        <div className="shrink-0 px-[40px] pt-[24px] pb-[32px] flex flex-col gap-[16px]">
          {/* 인사말 + 언어 선택 */}
          <div className="flex items-start justify-between px-[8px]">
            <p className="text-black text-[28px] font-bold leading-[1.4]">
              {t('kiosk_greeting').replace('{0}', studioName)}
            </p>

            {/* 언어 드롭다운 */}
            <div className="relative flex-shrink-0 ml-3">
              <button
                  onClick={() => setShowLocalePicker((v) => !v)}
                  className="h-[40px] px-[14px] rounded-[12px] bg-white border border-gray-200 flex items-center gap-[8px] shadow-sm"
              >
                <span className="text-[20px]">{currentLocale.flag}</span>
                <span className="text-[14px] font-medium text-black">{currentLocale.label}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showLocalePicker && (
                  <div className="absolute bottom-[46px] right-0 bg-white border border-gray-200 rounded-[12px] shadow-lg z-20 overflow-hidden min-w-[140px]">
                    {KIOSK_LOCALES.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => {
                              onChangeLocale(l.code);
                              setShowLocalePicker(false);
                            }}
                            className={`w-full px-[14px] py-[12px] flex items-center gap-[10px] text-left hover:bg-gray-50 active:bg-gray-100 ${l.code === locale ? 'bg-gray-50 font-bold' : ''}`}
                        >
                          <span className="text-[20px]">{l.flag}</span>
                          <span className="text-[14px] text-black">{l.label}</span>
                        </button>
                    ))}
                  </div>
              )}
            </div>
          </div>

          <div className="flex gap-[12px]">
            <div
                onClick={onSelectPayment}
                className="bg-white border-2 border-gray-100 rounded-[16px] p-[20px] flex-1 flex flex-col justify-between cursor-pointer hover:border-black transition-colors min-h-[120px]"
            >
              <div className="flex flex-col gap-[6px]">
                <p className="text-black text-[18px] font-bold">{t('kiosk_payment_title')}</p>
                <p className="text-gray-400 text-[14px]">{t('kiosk_payment_desc')}</p>
              </div>
              <div className="flex items-center justify-between mt-[12px]">
                <div className="bg-gray-100 rounded-[6px] px-[8px] py-[3px]">
                  <p className="text-gray-500 text-[12px] font-medium">{t('kiosk_payment_tag')}</p>
                </div>
              </div>
            </div>

            <div
                onClick={onSelectVisit}
                className="bg-white border-2 border-gray-100 rounded-[16px] p-[20px] flex-1 flex flex-col justify-between cursor-pointer hover:border-black transition-colors min-h-[120px]"
            >
              <div className="flex flex-col gap-[6px]">
                <p className="text-black text-[18px] font-bold">{t('kiosk_visit_title')}</p>
                <p className="text-gray-400 text-[14px]">{t('kiosk_visit_desc')}</p>
              </div>
              <div className="flex items-center justify-between mt-[12px]">
                <div className="bg-gray-100 rounded-[6px] px-[8px] py-[3px]">
                  <p className="text-gray-500 text-[12px] font-medium">{t('kiosk_visit_tag')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
