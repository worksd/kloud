'use client';

import React, { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// 비회원(게스트) 연습실 결제 — 결제하기 시 예약자 phone/name 입력 바텀시트.
// 확인 시 { phone, name } 을 반환하면 상위에서 customData에 실어 결제 진행.
// 국가번호(dial code, + 제외). 기본 한국(82).
const COUNTRY_CODES = [
  { code: '82', label: '🇰🇷 +82' },
  { code: '1', label: '🇺🇸 +1' },
  { code: '81', label: '🇯🇵 +81' },
  { code: '86', label: '🇨🇳 +86' },
  { code: '84', label: '🇻🇳 +84' },
  { code: '66', label: '🇹🇭 +66' },
  { code: '886', label: '🇹🇼 +886' },
  { code: '852', label: '🇭🇰 +852' },
];

// 결제 아이템별 제목/설명 문구 키
const TITLE_KEY: Record<string, Parameters<typeof getLocaleString>[0]['key']> = {
  'lesson': 'guest_title_lesson',
  'lesson-group': 'guest_title_lesson',
  'pass-plan': 'guest_title_pass',
  'practice-room': 'guest_title_room',
};
const DESC_KEY: Record<string, Parameters<typeof getLocaleString>[0]['key']> = {
  'lesson': 'guest_desc_lesson',
  'lesson-group': 'guest_desc_lesson',
  'pass-plan': 'guest_desc_pass',
  'practice-room': 'guest_desc_room',
};

export const GuestInfoBottomSheet = ({
  locale,
  itemType,
  onConfirm,
  onClose,
  onLogin,
}: {
  locale: Locale;
  /** 결제 아이템 종류(lesson/pass-plan/practice-room 등) — 제목·설명 문구 분기 */
  itemType?: string;
  onConfirm: (info: { phone: string; name: string; countryCode: string }) => void;
  onClose: () => void;
  /** '로그인하기' 탭 시 — 상위에서 로그인 화면으로 이동(returnUrl 포함) */
  onLogin?: () => void;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const titleKey = (itemType && TITLE_KEY[itemType]) || 'guest_info_title';
  const descKey = (itemType && DESC_KEY[itemType]) || 'guest_info_desc';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('82');
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

        <p className="text-[18px] font-bold text-[#171717]">{t(titleKey)}</p>
        <p className="mt-1 text-[13px] text-[#86898C] leading-snug">{t(descKey)}</p>

        {onLogin && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[12px] text-[#A0A5AB]">{t('guest_login_hint')}</span>
            <button
              onClick={() => close(() => onLogin())}
              className="text-[12px] font-bold text-[#4E5968] underline underline-offset-2 active:opacity-60"
            >
              {t('login_do')}
            </button>
          </div>
        )}

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
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-label="country code"
                className="h-12 shrink-0 rounded-xl bg-[#F1F3F6] px-3 text-[15px] text-[#171717] outline-none focus:ring-2 focus:ring-[#171717]/10"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                inputMode="numeric"
                type="tel"
                placeholder={t('guest_phone_placeholder')}
                className="h-12 flex-1 min-w-0 rounded-xl bg-[#F1F3F6] px-4 text-[15px] text-[#171717] placeholder:text-[#A0A5AB] outline-none focus:ring-2 focus:ring-[#171717]/10"
              />
            </div>
          </label>
        </div>

        <button
          disabled={!valid}
          onClick={() => close(() => onConfirm({ phone: digits, name: name.trim(), countryCode }))}
          className={`mt-5 w-full h-14 rounded-2xl flex items-center justify-center transition-transform ${valid ? 'bg-[#171717] active:scale-[0.98]' : 'bg-[#E0E0E0] cursor-not-allowed'}`}
        >
          <span className={`text-[16px] font-bold ${valid ? 'text-white' : 'text-[#999]'}`}>{t('confirm')}</span>
        </button>
      </div>
    </div>
  );
};
