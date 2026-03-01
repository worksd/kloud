'use client'

import { Ref, useCallback, useEffect, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const VerificationCodeForm = ({
                                       ref,
                                       value,
                                       handleChangeAction,
                                       placeholder,
                                       locale,
                                       resendAvailableAt,
                                       onResendAction,
                                     }: {
  value: string,
  handleChangeAction: (value: string) => void,
  placeholder: string,
  ref?: Ref<HTMLInputElement>;
  locale?: Locale;
  resendAvailableAt?: string | null;
  onResendAction?: () => void;
}) => {
  const [remainSeconds, setRemainSeconds] = useState(0);

  const calcRemain = useCallback(() => {
    if (!resendAvailableAt) return 0;
    return Math.ceil((new Date(resendAvailableAt).getTime() - Date.now()) / 1000);
  }, [resendAvailableAt]);

  useEffect(() => {
    if (!resendAvailableAt) return;
    setRemainSeconds(Math.max(0, calcRemain()));
    const id = setInterval(() => {
      const s = calcRemain();
      if (s <= 0) {
        setRemainSeconds(0);
        clearInterval(id);
      } else {
        setRemainSeconds(s);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [resendAvailableAt, calcRemain]);

  const t = (key: Parameters<typeof getLocaleString>[0]['key']) =>
    getLocaleString({locale: locale ?? 'ko', key});

  const canResend = remainSeconds <= 0;

  return (
    <div className="text-black">
      <div
        className="
          relative w-full rounded-[16px] border border-gray-200 bg-white px-4 py-3 shadow-sm
          transition-[border-color,box-shadow] duration-200
          focus-within:border-black
          flex items-center gap-2
        "
      >
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          className="flex-1 bg-transparent text-[16px] font-medium text-black placeholder:text-[#8B95A1] outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            if (v.length <= 6) handleChangeAction(v);
          }}
        />

        {onResendAction && (
          <button
            type="button"
            onClick={canResend ? onResendAction : undefined}
            className={[
              'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200',
              canResend
                ? 'bg-black text-white active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-default',
            ].join(' ')}
          >
            {canResend
              ? t('resend_code')
              : t('resend_countdown').replace('{0}', String(remainSeconds))
            }
          </button>
        )}
      </div>
    </div>
  )
}
