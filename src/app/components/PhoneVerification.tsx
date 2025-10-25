'use client';

import { Ref, useEffect, useMemo, useRef, useState } from 'react';
import BottomArrowIcon from "@/../public/assets/ic_arrow_bottom.svg"
import { COUNTRIES } from "@/app/certification/COUNTRIES";
import { CommonBottomSheet } from "@/app/onboarding/GenderBottomSheet";
import { getLocaleString } from "@/app/components/locale";
import CloseIcon from "../../../public/assets/ic_close.svg";
import { Locale } from "@/shared/StringResource";

/** ---------- Country Spec & Dataset ---------- */


// 숫자만 추출
const onlyDigits = (s = '') => s.replace(/\D/g, '');

// KR 전용 포맷: 010 1234 5678
function formatKR(digits: string) {
  const d = onlyDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7, 11)}`;
}

export function PhoneVerification({
                                    ref,
                                    phone,
                                    countryCode,
                                    onChangePhoneAction,
                                    onChangeCountryCodeAction,
                                    locale,
                                  }: {
  ref?: Ref<HTMLInputElement>;
  phone: string;
  countryCode: string;
  onChangePhoneAction: (phone: string) => void;
  onChangeCountryCodeAction: (countryCode: string) => void;
  locale: Locale,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.key === countryCode) ?? COUNTRIES[0],
    [countryCode]
  );

  const displayPhone = useMemo(
    () => (selected.key === 'KR' ? formatKR(phone) : phone),
    [selected.key, phone]
  );

  const onPhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangePhoneAction(onlyDigits(e.target.value));
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="w-full max-w-md mx-auto overflow-x-hidden">
      <div ref={wrapRef} className="relative overflow-visible">
        <div className="flex items-center gap-3 w-full rounded-[20px] border border-gray-300 p-4 shadow-sm bg-white">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 pr-2 border-r border-gray-200"
          >
            <span className="text-xl leading-none">{selected.flag}</span>
            <span className="text-[17px] text-black font-semibold tracking-tight">
              {selected.dial}+
            </span>
            <BottomArrowIcon/>
          </button>

          <input
            ref={ref}
            inputMode="numeric"
            value={displayPhone}
            onChange={onPhoneInputChange}
            placeholder={selected.key === 'KR' ? '010 1234 5678' : 'Phone number'}
            className="flex-1 bg-transparent text-[17px] text-black placeholder:text-[#8B95A1] outline-none"
          />
        </div>

        {open && (
          <DialogSelectionBottomSheet open={open} onCloseAction={() => setOpen(false)}
                                      onClickAction={onChangeCountryCodeAction} locale={locale}/>
        )}
      </div>
    </div>
  );
}

const DialogSelectionBottomSheet = ({open, onCloseAction, onClickAction, locale}: {
  open: boolean;
  onCloseAction: () => void,
  onClickAction: (value: string) => void,
  locale: Locale
}) => {
  return (
    <CommonBottomSheet open={open} onCloseAction={onCloseAction}>
        <div className="">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="text-[18px] font-bold text-black">{getLocaleString({locale, key: 'select_country'})}</div>
            <button
              type="button"
              aria-label="닫기"
              onClick={onCloseAction}
              className="p-2 -m-2 text-gray-500"
            >
              <CloseIcon/>
            </button>
          </div>
        <div className="p-2 overflow-y-auto max-h-[60vh]">
          {COUNTRIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                onClickAction(c.key)
                onCloseAction()
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="text-xl leading-none">{c.flag}</span>
              <span className="text-sm text-gray-900">{c.nameKo}</span>
              <span className="ml-auto text-sm font-semibold text-gray-700">+{c.dial}</span>
            </button>
          ))}
        </div>
        ))
      </div>
    </CommonBottomSheet>
  );
};