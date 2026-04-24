'use client';

import React, { useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/profile/setting/kiosk/KioskLessonListForm";

type KioskPhoneInputFormProps = {
  locale: Locale;
  onBack: () => void;
  onNext: (phone: string) => void;
  onHome: () => void;
  onChangeLocale: (locale: Locale) => void;
  loading?: boolean;
  errorMessage?: string | null;
  onDismissError?: () => void;
};

const formatPhone = (digits: string) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
};

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '010', '0', '←'];

export const KioskPhoneInputForm = ({ locale, onBack, onNext, onHome, onChangeLocale, loading, errorMessage, onDismissError }: KioskPhoneInputFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [digits, setDigits] = useState('');

  const handleKey = (key: string) => {
    if (key === '←') {
      setDigits(prev => prev.slice(0, -1));
    } else if (key === '010') {
      setDigits('010');
    } else {
      setDigits(prev => (prev.length < 11 ? prev + key : prev));
    }
  };

  const isValid = digits.length >= 10;

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 */}
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onHome={onHome} />

      {/* 타이틀 */}
      <div className="shrink-0 px-[5.6%] py-[1%]">
        <span className="text-black text-[min(3.7vw,40px)] font-bold">{t('kiosk_phone_title')}</span>
      </div>

      {/* 큰 안내 문구 */}
      <div className="shrink-0 px-[5.6%] pt-[min(18.5vw,200px)] pb-[min(1.8vw,20px)]">
        <p className="text-black text-[min(4.8vw,52px)] font-bold leading-tight">{t('kiosk_phone_desc')}</p>
      </div>

      {/* 입력 + 키패드 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 전화번호 입력 */}
        <div className="shrink-0 px-[5.6%] py-[min(2.8vw,30px)]">
          <div className="flex h-[min(13.9vw,150px)] bg-[#F9F9FB] rounded-[32px] overflow-hidden">
            {/* 국가코드 */}
            <div className="flex items-center gap-3 px-[min(3.7vw,40px)] border-r border-[#E8E8EA]">
              <span className="text-[min(3vw,32px)]">🇰🇷</span>
              <span className="text-[#1E2124] text-[min(3vw,32px)] font-medium">82+</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#6D7882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* 번호 */}
            <div className="flex-1 flex items-center px-[min(3.7vw,40px)]">
              <span className={`text-[min(3.7vw,40px)] font-medium ${digits ? 'text-black' : 'text-[#CDD1D5]'}`}>
                {digits ? formatPhone(digits) : '010 0000 0000'}
              </span>
            </div>
          </div>
        </div>

        {/* 숫자 키패드 */}
        <div className="flex-1 px-[9.3%] py-[min(1.8vw,20px)]">
          <div className="grid grid-cols-3 gap-[min(1.8vw,20px)] h-full">
            {NUMPAD_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className="rounded-[32px] flex items-center justify-center active:bg-[#F2F4F6] transition-colors"
              >
                <span className="text-[#1E2124] text-[min(4.6vw,50px)] font-bold">{key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="shrink-0 flex gap-[min(2.6vw,28px)] px-[min(4vw,44px)] pt-[min(2.9vw,32px)] pb-[min(4.4vw,48px)]">
        <button
          onClick={onBack}
          className="flex-[280] h-[min(13.9vw,150px)] rounded-[32px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-[#1E2124] text-[min(4.2vw,45px)] font-bold">{t('kiosk_back')}</span>
        </button>
        <button
          onClick={() => isValid && !loading && onNext(digits)}
          disabled={!isValid || loading}
          className={`flex-[684] h-[min(13.9vw,150px)] rounded-[32px] flex items-center justify-center active:scale-[0.97] transition-all ${
            isValid && !loading ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'
          }`}
        >
          {loading ? (
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="text-white text-[min(4.2vw,45px)] font-bold">{t('kiosk_next')}</span>
          )}
        </button>
      </div>

      {/* 에러 다이얼로그 */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
          <div className="absolute inset-0 bg-black/60" onClick={onDismissError} />
          <div className="relative w-[80%] max-w-[800px] bg-white rounded-[42px] flex flex-col items-center px-[min(5.6vw,60px)] py-[min(5.6vw,60px)] animate-[fadeIn_200ms_ease-out]">
            <div className="w-[min(7.4vw,80px)] h-[min(7.4vw,80px)] rounded-full bg-[#FFEDED] flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#E55B5B" strokeWidth="2"/>
                <path d="M12 8V12" stroke="#E55B5B" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#E55B5B"/>
              </svg>
            </div>
            <p className="text-black font-bold text-center whitespace-pre-line leading-snug" style={{ fontSize: 'min(3.7vw, 40px)' }}>
              {errorMessage}
            </p>
            <button
              onClick={onDismissError}
              className="mt-8 w-full h-[min(11vw,120px)] rounded-[32px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(4.2vw, 45px)' }}>{t('confirm')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
