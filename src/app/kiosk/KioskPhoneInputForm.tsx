'use client';

import React, { useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";
import { COUNTRIES } from "@/app/certification/COUNTRIES";
import { KioskCountrySelectModal } from "@/app/kiosk/KioskCountrySelectModal";
import { KioskEmailKeyboard } from "@/app/kiosk/KioskEmailKeyboard";

type KioskPhoneInputFormProps = {
  locale: Locale;
  onBack: () => void;
  onNext: (phone: string, countryCode: string) => void;
  onSearchByEmail: (email: string) => void;
  onHome: () => void;
  onChangeLocale: (locale: Locale) => void;
  loading?: boolean;
  errorMessage?: string | null;
  onDismissError?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatPhone = (digits: string) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
};

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '010', '0', '←'];

export const KioskPhoneInputForm = ({ locale, onBack, onNext, onSearchByEmail, onHome, onChangeLocale, loading, errorMessage, onDismissError }: KioskPhoneInputFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const [digits, setDigits] = useState('');
  const [countryKey, setCountryKey] = useState<string>('KR');
  const [countryOpen, setCountryOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const country = COUNTRIES.find((c) => c.key === countryKey) ?? COUNTRIES[0];

  const handleSubmitEmail = () => {
    if (loading) return;
    const trimmed = emailValue.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setValidationError(t('kiosk_email_invalid'));
      return;
    }
    setEmailModalOpen(false);
    setEmailValue('');
    onSearchByEmail(trimmed);
  };

  const handleKey = (key: string) => {
    if (key === '←') {
      setDigits(prev => prev.slice(0, -1));
    } else if (key === '010') {
      setDigits('010');
    } else {
      // 외국 번호 대응 — E.164 최대 15자리까지 허용
      setDigits(prev => (prev.length < 15 ? prev + key : prev));
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
      <div className="shrink-0 flex flex-col items-center justify-center px-[5.6%]" style={{ paddingTop: 'min(4vw, 44px)', paddingBottom: 'min(1.6vw, 18px)' }}>
        <p className="text-black font-bold text-center leading-tight" style={{ fontSize: 'min(3.7vw, 40px)' }}>
          {t('kiosk_phone_desc')}
        </p>
        {/* 이메일로 검색 — 휴대폰 번호 대신 이메일로 회원 검색하는 보조 진입점 */}
        <button
          type="button"
          onClick={() => { setEmailValue(''); setEmailModalOpen(true); }}
          className="mt-[min(1.2vw,14px)] text-[#6D7882] font-medium underline underline-offset-[6px] active:opacity-60 transition-opacity"
          style={{ fontSize: 'min(1.6vw, 18px)' }}
        >
          {t('kiosk_search_by_email')}
        </button>
      </div>

      {/* 입력 + 키패드 — 통합 라운드 카드 (키오스크 키패드 위젯 느낌) */}
      <div className="flex-1 flex items-center justify-center px-[5.6%] py-[min(0.8vw,10px)]">
        <div
          className="w-full bg-white rounded-[28px] flex flex-col"
          style={{
            maxWidth: 'min(58vw, 600px)',
            padding: 'min(1.8vw, 20px)',
            gap: 'min(1vw, 12px)',
            boxShadow: '0 10px 28px rgba(20, 23, 28, 0.05), 0 1px 6px rgba(20, 23, 28, 0.03)',
            border: '1px solid #EEF0F2',
          }}
        >
          {/* 전화번호 입력 */}
          <div className="flex items-center shrink-0 bg-[#F4F6F8] rounded-[16px] px-[min(2vw,22px)]" style={{ height: 'min(8.5vw, 92px)' }}>
            {/* 국가코드 — 클릭 시 국가 선택 모달 */}
            <button
              type="button"
              onClick={() => setCountryOpen(true)}
              className="shrink-0 flex items-center gap-[8px] pr-[min(1.6vw,18px)] active:opacity-70 transition-opacity"
            >
              <span style={{ fontSize: 'min(2vw, 22px)' }}>{country.flag}</span>
              <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(2vw, 22px)' }}>{country.dial}+</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#6D7882" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* 번호 — 좁은 카드에서 잘리지 않도록 min-w-0 + truncate */}
            <div className="flex-1 min-w-0 flex items-center px-[min(1.6vw,18px)]">
              <span className={`font-bold truncate ${digits ? 'text-black' : 'text-[#CDD1D5]'}`} style={{ fontSize: 'min(2.4vw, 26px)' }}>
                {digits ? formatPhone(digits) : '010 0000 0000'}
              </span>
            </div>
            {/* 지우기 — 아이콘 전용 (좁은 카드에서 폭 절약) */}
            {digits && (
              <button
                type="button"
                onClick={() => setDigits('')}
                aria-label={t('kiosk_clear_input')}
                className="shrink-0 rounded-full bg-[#86898C] flex items-center justify-center active:scale-[0.92] transition-transform"
                style={{ width: 'min(3.4vw, 36px)', height: 'min(3.4vw, 36px)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '55%', height: '55%' }}>
                  <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* 숫자 키패드 */}
          <div className="grid grid-cols-3 gap-[min(1vw,12px)]">
            {NUMPAD_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className="rounded-[18px] aspect-[5/3] flex items-center justify-center bg-[#F4F6F8] active:bg-[#E6E9EC] transition-colors"
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(3.2vw, 34px)' }}>{key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 — 카드 폭과 동일하게 가운데 정렬 */}
      <div className="shrink-0 flex justify-center px-[5.6%] pt-[min(1.4vw,16px)] pb-[min(1.8vw,20px)]">
        <div
          className="w-full flex gap-[min(1.4vw,16px)]"
          style={{ maxWidth: 'min(58vw, 600px)' }}
        >
          <button
            onClick={onBack}
            className="flex-[280] h-[min(7vw,76px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] text-[min(2.4vw,26px)] font-bold">{t('kiosk_back')}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={!canSubmit}
            className={`flex-[684] h-[min(7vw,76px)] rounded-[16px] flex items-center justify-center active:scale-[0.97] transition-all ${
              canSubmit ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'
            }`}
          >
            {loading ? (
              <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-white text-[min(2.4vw,26px)] font-bold">{t('kiosk_next')}</span>
            )}
          </button>
        </div>
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

      {/* 이메일 검색 모달 — 키오스크용 가상 키보드 내장 (네이티브 키보드 대체) */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEmailModalOpen(false)} />
          <div className="relative w-[92%] max-w-[1100px] bg-white rounded-[42px] flex flex-col px-[min(4vw,44px)] py-[min(4vw,44px)] animate-[fadeIn_200ms_ease-out]">
            <p className="text-black font-bold text-center" style={{ fontSize: 'min(3vw, 32px)' }}>
              {t('kiosk_email_modal_title')}
            </p>

            {/* 입력 디스플레이 — 키보드가 값 관리, 여기선 표시만 */}
            <div className="mt-[min(2.4vw,26px)] w-full bg-[#F9F9FB] rounded-[16px] px-[min(3vw,32px)] flex items-center" style={{ height: 'min(8vw, 86px)' }}>
              <span className={`font-medium truncate ${emailValue ? 'text-black' : 'text-[#CDD1D5]'}`} style={{ fontSize: 'min(2.6vw, 28px)' }}>
                {emailValue || t('kiosk_email_placeholder')}
              </span>
            </div>

            {/* 가상 키보드 */}
            <div className="mt-[min(2vw,22px)]">
              <KioskEmailKeyboard value={emailValue} onChange={setEmailValue} />
            </div>

            <div className="mt-[min(2.4vw,26px)] flex gap-[min(2vw,22px)]">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="flex-[3] h-[min(9vw,98px)] rounded-[24px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
              >
                <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>{t('kiosk_back')}</span>
              </button>
              <button
                onClick={handleSubmitEmail}
                disabled={loading || emailValue.trim().length === 0}
                className={`flex-[7] h-[min(9vw,98px)] rounded-[24px] flex items-center justify-center active:scale-[0.97] transition-all ${
                  emailValue.trim().length > 0 && !loading ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'
                }`}
              >
                <span className="text-white font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>{t('kiosk_search')}</span>
              </button>
            </div>
          </div>
        </div>
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
