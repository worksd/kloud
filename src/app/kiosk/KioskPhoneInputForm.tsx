'use client';

import React, { useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";
import { COUNTRIES } from "@/app/certification/COUNTRIES";
import { KioskCountrySelectModal } from "@/app/kiosk/KioskCountrySelectModal";

type KioskPhoneInputFormProps = {
  locale: Locale;
  onBack: () => void;
  onNext: (phone: string, countryCode: string) => void;
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
  const [countryKey, setCountryKey] = useState<string>('KR');
  const [countryOpen, setCountryOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const country = COUNTRIES.find((c) => c.key === countryKey) ?? COUNTRIES[0];

  const handleKey = (key: string) => {
    if (key === '←') {
      setDigits(prev => prev.slice(0, -1));
    } else if (key === '010') {
      setDigits('010');
    } else {
      setDigits(prev => (prev.length < 11 ? prev + key : prev));
    }
  };

  // 국가별 길이 검증
  const isPhoneValid = (() => {
    if (country.dial === '82') return digits.startsWith('010') && digits.length === 11;
    if (country.dial === '1') return digits.length === 10; // US/CA
    if (country.dial === '81') return digits.length >= 10 && digits.length <= 11; // JP
    if (country.dial === '86') return digits.length === 11; // CN
    if (country.dial === '886') return digits.length >= 9 && digits.length <= 10; // TW
    if (country.dial === '852') return digits.length === 8; // HK
    if (country.dial === '65') return digits.length === 8; // SG
    return digits.length >= 8;
  })();
  const canSubmit = digits.length > 0 && !loading;

  const handleNext = () => {
    if (loading) return;
    if (!isPhoneValid) {
      setValidationError(t('kiosk_phone_error'));
      return;
    }
    onNext(digits, country.dial);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 */}
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onHome} />

      {/* 큰 안내 문구 — 가운데 정렬 */}
      <div className="shrink-0 flex items-center justify-center px-[5.6%]" style={{ paddingTop: 'min(8vw, 80px)', paddingBottom: 'min(2.8vw, 30px)' }}>
        <p className="text-black font-bold text-center leading-tight" style={{ fontSize: 'min(4.8vw, 52px)' }}>
          {t('kiosk_phone_desc')}
        </p>
      </div>

      {/* 입력 + 키패드 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 전화번호 입력 */}
        <div className="shrink-0 px-[5.6%] py-[min(1.4vw,16px)]">
          <div className="flex items-center h-[min(13.9vw,150px)] bg-[#F9F9FB] rounded-[16px] px-[min(3.7vw,40px)]">
            {/* 국가코드 — 클릭 시 국가 선택 모달 */}
            <button
              type="button"
              onClick={() => setCountryOpen(true)}
              className="flex items-center gap-[10px] pr-[min(2.6vw,28px)] active:opacity-70 transition-opacity"
            >
              <span style={{ fontSize: 'min(3vw, 32px)' }}>{country.flag}</span>
              <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(3vw, 32px)' }}>{country.dial}+</span>
              <svg width="14" height="9" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#6D7882" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* 번호 */}
            <div className="flex-1 flex items-center px-[min(2.6vw,28px)]">
              <span className={`font-bold ${digits ? 'text-black' : 'text-[#CDD1D5]'}`} style={{ fontSize: 'min(3.7vw, 40px)' }}>
                {digits ? formatPhone(digits) : '010 0000 0000'}
              </span>
            </div>
            {/* 모두 지우기 — 라벨 + X 아이콘 (디지트가 있을 때만 노출) */}
            {digits && (
              <button
                type="button"
                onClick={() => setDigits('')}
                aria-label={t('kiosk_clear_input')}
                className="shrink-0 flex items-center bg-[#E6E8EA] rounded-full active:scale-[0.96] transition-transform"
                style={{ height: 'min(7vw, 76px)', padding: '0 min(2vw, 22px)', gap: 'min(0.8vw, 10px)' }}
              >
                <span className="rounded-full bg-[#86898C] flex items-center justify-center" style={{ width: 'min(3vw, 32px)', height: 'min(3vw, 32px)' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
                    <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.2vw, 24px)' }}>
                  {t('kiosk_clear_input')}
                </span>
              </button>
            )}
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
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(4.6vw, 50px)' }}>{key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="shrink-0 flex gap-[min(2.6vw,28px)] px-[min(4vw,44px)] pt-[min(2.9vw,32px)] pb-[min(4.4vw,48px)]">
        <button
          onClick={onBack}
          className="flex-[280] h-[min(13.9vw,150px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-[#1E2124] text-[min(4.2vw,45px)] font-bold">{t('kiosk_back')}</span>
        </button>
        <button
          onClick={handleNext}
          disabled={!canSubmit}
          className={`flex-[684] h-[min(13.9vw,150px)] rounded-[16px] flex items-center justify-center active:scale-[0.97] transition-all ${
            canSubmit ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'
          }`}
        >
          {loading ? (
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="text-white text-[min(4.2vw,45px)] font-bold">{t('kiosk_next')}</span>
          )}
        </button>
      </div>

      {/* 국가 선택 모달 */}
      {countryOpen && (
        <KioskCountrySelectModal
          selectedKey={countryKey}
          locale={locale}
          onConfirm={(key) => { setCountryKey(key); setCountryOpen(false); }}
          onCancel={() => setCountryOpen(false)}
        />
      )}

      {/* 에러 다이얼로그 */}
      {(errorMessage || validationError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setValidationError(null); onDismissError?.(); }} />
          <div className="relative w-[80%] max-w-[800px] bg-white rounded-[42px] flex flex-col items-center px-[min(5.6vw,60px)] py-[min(5.6vw,60px)] animate-[fadeIn_200ms_ease-out]">
            <div className="w-[min(7.4vw,80px)] h-[min(7.4vw,80px)] rounded-full bg-[#FFEDED] flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#E55B5B" strokeWidth="2"/>
                <path d="M12 8V12" stroke="#E55B5B" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#E55B5B"/>
              </svg>
            </div>
            <p className="text-black font-bold text-center whitespace-pre-line leading-snug" style={{ fontSize: 'min(3.7vw, 40px)' }}>
              {errorMessage ?? validationError}
            </p>
            <button
              onClick={() => { setValidationError(null); onDismissError?.(); }}
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
