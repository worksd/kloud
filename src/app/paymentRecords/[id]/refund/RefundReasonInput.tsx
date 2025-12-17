'use client'

import { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

type RefundReasonInputProps = {
  locale: Locale;
  onReasonChange?: (reason: string) => void;
}

export const RefundReasonInput = ({ locale, onReasonChange }: RefundReasonInputProps) => {
  const [reason, setReason] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    onReasonChange?.(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <span className="text-[14px] font-medium text-black">
          {getLocaleString({locale, key: 'refund_reason'})}
        </span>
        <span className="text-[12px] text-[#e55b5b]">
          {getLocaleString({locale, key: 'required'})}
        </span>
      </div>
      <textarea
        value={reason}
        onChange={handleChange}
        placeholder={getLocaleString({locale, key: 'refund_reason_placeholder'})}
        className="w-full h-[48px] border border-[#e6e8ea] rounded-[12px] px-4 py-3 text-[14px] font-medium text-black placeholder:text-[#b1b8be] focus:outline-none focus:border-black resize-none"
      />
    </div>
  );
};

