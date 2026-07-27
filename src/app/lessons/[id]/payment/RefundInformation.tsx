'use client'
import ArrowUpIcon from "../../../../../public/assets/arrow-up.svg";
import ArrowDownIcon from "../../../../../public/assets/arrow-down.svg";
import { useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export const RefundInformation = ({locale, paymentId, isRefundable, roomRefundDays}: {
  locale: Locale,
  paymentId?: string,
  isRefundable?: boolean,
  /** 대관 이용료 환불 기준일. 내려오면 대관 전용 환불 안내로 대체({days}=N). 없으면 기본(수강료) 안내. */
  roomRefundDays?: number | null,
}) => {
  const [expanded, setExpanded] = useState(false);
  // 대관 결제면 이용료 환불 문구로 교체. 상단 2문단만 다르고 하단(약관 동의·중개·고객센터)은 공통 재사용.
  const isRoom = roomRefundDays != null;
  const topMessage1 = isRoom
    ? getLocaleString({locale, key: 'room_refund_message_1'}).replace('{days}', String(roomRefundDays))
    : getLocaleString({locale, key: 'lesson_refund_message_1'});
  const topMessage2 = getLocaleString({locale, key: isRoom ? 'room_refund_message_2' : 'lesson_refund_message_2'});
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
        <div className={`text-[#6b6e71] text-[10px] font-medium leading-[14px] ${isRoom ? 'whitespace-pre-line' : ''}`}>
          <p className="pb-4">{topMessage1}</p>
          <p>{topMessage2}</p>
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
          className="mt-10 text-[#6b6e71] text-[10px] font-medium leading-[14px]">
          <p className="pb-4">{getLocaleString({locale, key: 'lesson_refund_message_3'})}</p>
          <p>{getLocaleString({locale, key: 'lesson_refund_message_4'})}</p>
          <p>{getLocaleString({locale, key: 'lesson_refund_message_5'})}</p>
        </div>
      </div>}
    </div>
  )
}