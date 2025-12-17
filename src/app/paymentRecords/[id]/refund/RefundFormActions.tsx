'use client'

import { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { RefundReasonInput } from "./RefundReasonInput";
import { getLocaleString } from "@/app/components/locale";

type RefundFormActionsProps = {
  locale: Locale;
}

export const RefundFormActions = ({ locale }: RefundFormActionsProps) => {
  const [reason, setReason] = useState("");

  return (
    <>
      {/* 환불 사유 */}
      <div className="px-5 py-5">
        <RefundReasonInput locale={locale} onReasonChange={setReason} />
      </div>

      {/* 환불하기 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 py-2 px-3 bg-white border-t border-gray-200">
        <button 
          disabled={reason.trim().length === 0}
          className={`w-full h-14 rounded-[16px] flex items-center justify-center transition-colors ${
            reason.trim().length > 0
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-[#b1b8be] text-white cursor-not-allowed'
          }`}
        >
          <span className="text-[16px] font-medium">
            {getLocaleString({locale, key: 'do_refund'})}
          </span>
        </button>
      </div>
    </>
  );
};

