'use client';

import { Ref, useEffect, useMemo, useRef, useState } from 'react';
import BottomArrowIcon from "@/../public/assets/ic_arrow_bottom.svg"
import { COUNTRIES } from "@/app/certification/COUNTRIES";

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
                                  }: {
  ref?: Ref<HTMLInputElement>;
  phone: string;
  countryCode: string;
  onChangePhoneAction: (phone: string) => void;
  onChangeCountryCodeAction: (countryCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.key === countryCode) ?? COUNTRIES[0],
    [countryCode]
  );

  // 표시용 값: KR이면 스페이스 포맷, 아니면 그대로
  const displayPhone = useMemo(
    () => (selected.key === 'KR' ? formatKR(phone) : phone),
    [selected.key, phone]
  );

  const onPhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 상태에는 항상 숫자만 저장
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
      <div ref={wrapRef} className="relative">
        <div className="flex items-center gap-3 w-full rounded-[20px] border border-gray-300 p-4 shadow-sm bg-white">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 pr-2 border-r border-gray-200"
            aria-haspopup="listbox"
            aria-expanded={open}
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
          <div
            className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
            {['아메리카', '아시아', '중동', '오세아니아', '유럽'].map((group) => (
              <div key={group}>
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-500 sticky top-0 bg-white">
                  {group}
                </div>
                {COUNTRIES.filter((c) => c.region === group).map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      onChangeCountryCodeAction(c.dial);
                      setOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    role="option"
                    aria-selected={c.key === selected.key}
                  >
                    <span className="text-xl leading-none">{c.flag}</span>
                    <span className="text-sm text-gray-900">{c.nameKo}</span>
                    <span className="ml-auto text-sm font-semibold text-gray-700">
                      +{c.dial}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}