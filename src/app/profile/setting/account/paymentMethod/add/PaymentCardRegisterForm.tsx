'use client'
// 신용/체크카드 등록 폼(페이지). 토스 카드 등록 화면 구성 — 명의 안내 배너 / 카드번호(법인카드 체크) / 유효기간 MM/YY + 비밀번호 앞 2자리 / 생년월일(법인은 사업자번호) / 하단 고정 '등록'.
// 서버(POST /billing)가 받는 값: cardNumber, expiryMonth, expiryYear, birthOrBusinessRegistrationNumber(6 또는 10자리), passwordTwoDigits — CVC 는 받지 않는다.
// 등록 성공 → 앱은 뒤로(결제수단 관리가 onReload 로 다시 불러온다), 웹은 관리 페이지로 replace.

import React, { useMemo, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { CreateBillingRequest } from "@/app/endpoint/billing.endpoint";
import { addBillingAction } from "@/app/profile/setting/account/paymentMethod/add.billing.action";
import { createDialog } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { CardFlatIcon } from "@/app/profile/ActivityIcons";
import CloseIcon from "@/../public/assets/ic_close.svg";

const digits = (s: string) => s.replace(/\D/g, '');

export const PaymentCardRegisterForm = ({ locale, isWeb, ownerName, initialBirth, returnBack = false }: {
  locale: Locale;
  /** 웹 직접 접근 — X + 제목 헤더를 직접 그린다(앱은 네이티브 앱바) */
  isWeb: boolean;
  ownerName: string;
  /** 프로필 생년월일('yyMMdd' 또는 'yyyyMMdd') — 개인 카드면 미리 채운다 */
  initialBirth?: string | null;
  /** 결제 화면에서 왔으면 등록 후 웹도 뒤로(기본은 결제수단 관리로) */
  returnBack?: boolean;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const birth6 = initialBirth ? (initialBirth.length === 8 ? initialBirth.slice(2) : initialBirth) : '';

  const [cardNumber, setCardNumber] = useState('');       // 숫자만(최대 16)
  const [expiry, setExpiry] = useState('');               // 'MMYY' 숫자만
  const [password, setPassword] = useState('');           // 앞 2자리
  const [corporate, setCorporate] = useState(false);      // 법인카드 — 생년월일 대신 사업자번호 10자리
  const [birth, setBirth] = useState(birth6);             // 6자리
  const [business, setBusiness] = useState('');           // 10자리
  const [error, setError] = useState<string | null>(null);

  const expiryRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  // 표시용 포맷 — '4092 - 1673 - 1234 - 5678', 'MM / YY'
  const cardDisplay = useMemo(() => cardNumber.match(/.{1,4}/g)?.join(' - ') ?? '', [cardNumber]);
  const expiryDisplay = expiry.length > 2 ? `${expiry.slice(0, 2)} / ${expiry.slice(2)}` : expiry;

  const idValue = corporate ? business : birth;
  const idComplete = corporate ? business.length === 10 : birth.length === 6;
  const complete = cardNumber.length >= 15 && expiry.length === 4 && password.length === 2 && idComplete;

  const showFail = async (message?: string) => {
    const msg = message || t('billing_register_fail');
    if (isWeb || !window.KloudEvent) { setError(msg); return; }
    const dialog = await createDialog({ id: 'Simple', title: t('billing_register_fail_title'), message: msg });
    window.KloudEvent.showDialog(JSON.stringify(dialog));
  };

  const submit = async () => {
    if (!complete) return;
    setError(null);
    const req: CreateBillingRequest = {
      cardNumber,
      expiryMonth: expiry.slice(0, 2),
      expiryYear: expiry.slice(2, 4),
      birthOrBusinessRegistrationNumber: idValue,
      passwordTwoDigits: password,
    };
    try {
      const res = await addBillingAction(req);
      if ('billingKey' in res) {
        // 서버 반영 지연 — 바로 돌아가면 목록에 안 보이던 문제(기존 시트와 같은 대기)
        await new Promise((r) => setTimeout(r, 2000));
        if (window.KloudEvent) kloudNav.back();
        else if (returnBack) window.history.back();
        else window.location.replace(KloudScreen.PaymentMethodSetting);
      } else if ('pgMessage' in res && res.pgMessage) {
        await showFail(res.pgMessage);
      } else if ('message' in res) {
        await showFail(res.message);
      } else {
        await showFail();
      }
    } catch {
      await showFail();
    }
  };

  const field = 'w-full h-14 rounded-xl bg-[#F4F5F7] px-4 text-[17px] text-[#191F28] placeholder-[#B0B8C1] focus:outline-none focus:ring-2 focus:ring-[#191F28]/80 tracking-[0.02em]';
  const label = 'text-[15px] font-bold text-[#191F28] tracking-[-0.3px]';

  return (
    <div className={`min-h-screen bg-white ${isWeb ? 'lg:min-h-0' : ''}`}>
      <div className={`mx-auto w-full ${isWeb ? 'lg:max-w-[560px] lg:pt-10' : ''}`}>
        {/* 웹 헤더 — X + 제목. 앱은 네이티브 앱바가 제목을 그린다 */}
        {isWeb && (
          <div className="flex items-center gap-4 px-4 h-14">
            <button type="button" aria-label="close" onClick={() => window.history.back()} className="w-9 h-9 flex items-center justify-center -ml-1">
              <CloseIcon className="w-5 h-5 text-black"/>
            </button>
            <h1 className="text-[18px] font-semibold text-[#191F28]">{t('card_register_title')}</h1>
          </div>
        )}

        {/* 명의 안내 */}
        <div className="bg-[#EEF3FF] px-5 py-4 flex items-center justify-center gap-2 text-[14px] text-[#4E5968]">
          <span className="w-4 h-4 rounded-full bg-[#8B95A1] text-white text-[11px] font-bold flex items-center justify-center shrink-0">!</span>
          <span>{t('card_register_owner_notice').replace('{name}', ownerName)}</span>
        </div>

        <div className="px-5 pt-7 pb-36 flex flex-col gap-7">
          {/* 카드번호 + 법인카드 체크 */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className={label}>{t('card_register_card_number')}</span>
              <label className="flex items-center gap-2 text-[14px] text-[#4E5968] select-none">
                <input type="checkbox" className="sr-only peer" checked={corporate} onChange={(e) => { setCorporate(e.target.checked); setError(null); }}/>
                <span className="w-5 h-5 rounded-md border-[1.5px] border-[#C4C9CF] peer-checked:bg-[#191F28] peer-checked:border-[#191F28] flex items-center justify-center">
                  {corporate && (
                    <svg width="11" height="9" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </span>
                {t('card_register_corporate')}
              </label>
            </div>
            <div className="relative">
              {cardNumber.length > 0 && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><CardFlatIcon size={22}/></span>
              )}
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                autoFocus
                placeholder="0000 - 0000 - 0000 - 0000"
                value={cardDisplay}
                onChange={(e) => {
                  const v = digits(e.target.value).slice(0, 16);
                  setCardNumber(v); setError(null);
                  if (v.length === 16) expiryRef.current?.focus();
                }}
                className={`${field} ${cardNumber.length > 0 ? 'pl-12' : ''} font-paperlogy`}
              />
            </div>
          </div>

          {/* 유효기간 / 비밀번호 앞 2자리 */}
          <div className="flex gap-4">
            <div className="flex-1 min-w-0 flex flex-col gap-2.5">
              <span className={label}>{t('expiration_date')}</span>
              <input
                ref={expiryRef}
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                value={expiryDisplay}
                onChange={(e) => {
                  const v = digits(e.target.value).slice(0, 4);
                  setExpiry(v); setError(null);
                  if (v.length === 4) passwordRef.current?.focus();
                }}
                className={`${field} font-paperlogy`}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2.5">
              <span className={label}>{t('card_register_password')}</span>
              <input
                ref={passwordRef}
                type="password"
                inputMode="numeric"
                placeholder={t('card_register_password_placeholder')}
                value={password}
                onChange={(e) => {
                  const v = digits(e.target.value).slice(0, 2);
                  setPassword(v); setError(null);
                  if (v.length === 2 && !idComplete) idRef.current?.focus();
                }}
                className={field}
              />
            </div>
          </div>

          {/* 생년월일(개인) / 사업자번호(법인) */}
          <div className="flex flex-col gap-2.5">
            <span className={label}>{corporate ? t('business_registration_number') : t('card_birthday_placeholder')}</span>
            <input
              ref={idRef}
              type="text"
              inputMode="numeric"
              placeholder={corporate ? t('card_register_business_placeholder') : t('card_register_birth_placeholder')}
              value={idValue}
              onChange={(e) => {
                const v = digits(e.target.value).slice(0, corporate ? 10 : 6);
                if (corporate) setBusiness(v); else setBirth(v);
                setError(null);
              }}
              className={`${field} font-paperlogy`}
            />
            {!corporate && birth6 && birth === birth6 && (
              <span className="text-[12px] text-[#8B95A1] px-1">{t('birth_from_profile')}</span>
            )}
          </div>

          {error && <p className="text-[13px] font-medium text-[#E5484D]">{error}</p>}
        </div>

        {/* 하단 고정 등록 버튼 — 키보드가 올라오면 가려지고, 칸을 다 채우면 키보드를 내리고 누른다 */}
        <div className={`fixed inset-x-0 bottom-0 bg-white px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] ${isWeb ? 'lg:static lg:px-5 lg:pb-6' : ''}`}>
          <button
            type="button"
            disabled={!complete}
            onClick={submit}
            className="w-full h-14 rounded-2xl bg-[#191F28] text-white text-[16px] font-bold disabled:bg-[#F2F4F6] disabled:text-[#B0B8C1] active:opacity-90 transition-colors"
          >
            {t('card_register_submit')}
          </button>
        </div>
      </div>
    </div>
  );
};
