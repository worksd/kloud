'use client'

import { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const RefundReasonInput = ({ locale }: { locale: Locale }) => {
  const [reason, setReason] = useState("");

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
        onChange={(e) => setReason(e.target.value)}
        placeholder={getLocaleString({locale, key: 'refund_reason_placeholder'})}
        className="w-full h-[48px] border border-[#e6e8ea] rounded-[12px] px-4 py-3 text-[14px] font-medium text-black placeholder:text-[#b1b8be] focus:outline-none focus:border-black resize-none"
      />
    </div>
  );
};

