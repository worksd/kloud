'use client';

import React, { useEffect, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { sendPaymentPhoneCodeAction, verifyPaymentPhoneLoginAction } from "@/app/payment/phone.auth.action";

// 비회원 결제 폐지 → 결제 전 폰 인증 로그인 시트. 정보 입력 → 인증번호 확인(=폰 로그인, 토큰 쿠키 저장)
// → onAuthenticated로 상위에서 회원 결제 진행.
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

// 전화번호 표시 포맷(하이픈). 한국(82)은 3-4-4(최대 11자리), 그 외는 숫자 그대로.
const formatPhoneDisplay = (digits: string, countryCode: string) => {
  if (countryCode !== '82') return digits;
  const n = digits.slice(0, 11);
  if (n.length < 4) return n;
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
};

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
  onAuthenticated,
  onClose,
  onLogin,
}: {
  locale: Locale;
  /** 결제 아이템 종류(lesson/pass-plan/practice-room 등) — 제목·설명 문구 분기 */
  itemType?: string;
  /** 폰 인증 로그인 성공 시 — 상위에서 회원으로 결제 진행 */
  onAuthenticated: (info: { userId: number; name: string; phone: string; countryCode: string }) => void;
  onClose: () => void;
  /** '로그인하기' 탭 시 — 소셜/이메일 등 다른 방식 로그인 화면으로 이동 */
  onLogin?: () => void;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const titleKey = (itemType && TITLE_KEY[itemType]) || 'guest_info_title';
  const descKey = (itemType && DESC_KEY[itemType]) || 'guest_info_desc';

  const [step, setStep] = useState<'input' | 'code'>('input');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('82');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [entered, setEntered] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const closingRef = useRef(false);

  // 마운트 시 슬라이드업 + 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = prev; };
  }, []);

  const close = (after?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setDragging(false);
    dragStart.current = null;
    setEntered(false); // 슬라이드 다운
    setTimeout(() => { after?.(); onClose(); }, 250);
  };

  // 시트 드래그로 내려 닫기
  const onDragStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientY; };
  const onDragMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    if (dy > 0) { setDragging(true); setDragY(dy); }
    else if (dragY !== 0) setDragY(0);
  };
  const onDragEnd = () => {
    if (dragStart.current == null) return;
    dragStart.current = null;
    setDragging(false);
    if (dragY > 100) close();   // 충분히 내리면 닫기
    else setDragY(0);           // 아니면 스냅백
  };

  const digits = phone.replace(/\D/g, '');
  const canSend = name.trim().length > 0 && digits.length >= 9;
  const canVerify = code.trim().length >= 4;

  const handleSend = async () => {
    if (!canSend || sending) return;
    setError(null);
    setSending(true);
    try {
      const res = await sendPaymentPhoneCodeAction({ phone: digits, countryCode });
      if ('ttl' in res) {
        setStep('code');
        setCode('');
      } else {
        setError(res.message);
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!canVerify || verifying) return;
    setError(null);
    setVerifying(true);
    try {
      const res = await verifyPaymentPhoneLoginAction({ code: code.trim(), phone: digits, countryCode, name: name.trim() });
      if ('accessToken' in res && res.accessToken) {
        close(() => onAuthenticated({ userId: res.user.id, name: name.trim(), phone: digits, countryCode }));
      } else {
        setError('message' in res ? res.message : t('unknown_error_message'));
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      <div className="absolute inset-0 bg-black/50" style={{ opacity: entered ? 1 : 0, transition: 'opacity 250ms ease' }} onClick={() => close()} />
      <div
        className="relative w-full bg-white rounded-t-3xl px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] will-change-transform"
        style={{
          transform: `translateY(${entered ? dragY : (typeof window !== 'undefined' ? window.innerHeight : 1000)}px)`,
          transition: dragging ? 'none' : 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mb-4" />

        <p className="text-[18px] font-bold text-[#171717]">{t(titleKey)}</p>
        <p className="mt-1 text-[13px] text-[#86898C] leading-snug">{t(descKey)}</p>

        {step === 'input' ? (
          <>
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
                    value={formatPhoneDisplay(phone, countryCode)}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    type="tel"
                    placeholder={t('guest_phone_placeholder')}
                    className="h-12 flex-1 min-w-0 rounded-xl bg-[#F1F3F6] px-4 text-[15px] text-[#171717] placeholder:text-[#A0A5AB] outline-none focus:ring-2 focus:ring-[#171717]/10"
                  />
                </div>
              </label>
            </div>

            {error && <p className="mt-3 text-[12px] text-[#E5484D]">{error}</p>}

            <button
              type="button"
              disabled={!canSend || sending}
              onClick={handleSend}
              className={`mt-5 w-full h-14 rounded-2xl flex items-center justify-center transition-transform ${canSend && !sending ? 'bg-[#171717] active:scale-[0.98]' : 'bg-[#E0E0E0] cursor-not-allowed'}`}
            >
              <span className={`text-[16px] font-bold ${canSend && !sending ? 'text-white' : 'text-[#999]'}`}>{t('submit_code')}</span>
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 text-[13px] text-[#4E5968]">
              {t('guest_code_sent')} <span className="font-bold">{`+${countryCode} ${formatPhoneDisplay(phone, countryCode)}`}</span>
            </p>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-[#4E5968]">{t('certification_code')}</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                inputMode="numeric"
                type="tel"
                autoFocus
                placeholder={t('placeholder_six_code')}
                className="h-12 rounded-xl bg-[#F1F3F6] px-4 text-[15px] tracking-widest text-[#171717] placeholder:text-[#A0A5AB] placeholder:tracking-normal outline-none focus:ring-2 focus:ring-[#171717]/10"
              />
            </label>

            <div className="mt-2 flex items-center justify-between">
              <button type="button" onClick={() => { setStep('input'); setError(null); }} className="text-[12px] text-[#A0A5AB] active:opacity-60">
                {t('guest_phone_label')}
              </button>
              <button type="button" disabled={sending} onClick={handleSend} className="text-[12px] font-bold text-[#4E5968] underline underline-offset-2 active:opacity-60 disabled:opacity-50">
                {t('certification_code_retry')}
              </button>
            </div>

            {error && <p className="mt-3 text-[12px] text-[#E5484D]">{error}</p>}

            <button
              type="button"
              disabled={!canVerify || verifying}
              onClick={handleVerify}
              className={`mt-5 w-full h-14 rounded-2xl flex items-center justify-center transition-transform ${canVerify && !verifying ? 'bg-[#171717] active:scale-[0.98]' : 'bg-[#E0E0E0] cursor-not-allowed'}`}
            >
              <span className={`text-[16px] font-bold ${canVerify && !verifying ? 'text-white' : 'text-[#999]'}`}>{t('guest_verify_continue')}</span>
            </button>
          </>
        )}

        {onLogin && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="text-[12px] text-[#A0A5AB]">{t('guest_login_hint')}</span>
            <button
              type="button"
              onClick={() => close(() => onLogin())}
              className="text-[12px] font-bold text-[#4E5968] underline underline-offset-2 active:opacity-60"
            >
              {t('login_do')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
