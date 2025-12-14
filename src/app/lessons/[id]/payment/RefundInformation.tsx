'use client'
import ArrowUpIcon from "../../../../../public/assets/arrow-up.svg";
import ArrowDownIcon from "../../../../../public/assets/arrow-down.svg";
import { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export const RefundInformation = ({locale, paymentId, isRefundable}: { 
  locale: Locale,
  paymentId?: string,
  isRefundable?: boolean
}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div className="flex flex-row items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className={'font-medium text-[14px] text-black'}>{getLocaleString({
          locale,
          key: 'refund_information'
        })}</div>
        {expanded ? <ArrowUpIcon/> : <ArrowDownIcon/>}
      </div>
      {expanded && <div className={'flex flex-col space-y-4 mt-5'}>
        <div className="text-[#86898c] text-[12px] font-medium">
          <p className="pb-4">{getLocaleString({locale, key: 'lesson_refund_message_1'})}</p>
          <p>{getLocaleString({locale, key: 'lesson_refund_message_2'})}</p>
        </div>

        {isRefundable && paymentId && (
          <NavigateClickWrapper
            method="push"
            route={KloudScreen.PaymentRecordRefund(paymentId)}
          >
            <button className="w-full border border-[#e55b5b] rounded-[8px] h-9 px-[10px] flex items-center justify-center gap-1 active:scale-[0.95] transition-transform duration-150">
              <span className="text-[14px] font-medium text-[#e55b5b]">{getLocaleString({locale, key: 'do_cancel'})}</span>
            </button>
          </NavigateClickWrapper>
        )}

        <div
          className="mt-10 text-center text-[#6b6e71] text-[10px] font-medium leading-[14px]">
          <p className="pb-4">{getLocaleString({locale, key: 'lesson_refund_message_3'})}</p>
          <p>{getLocaleString({locale, key: 'lesson_refund_message_4'})}</p>
          <p>{getLocaleString({locale, key: 'lesson_refund_message_5'})}</p>
        </div>
      </div>}
    </div>
  )
}