'use client'
import { useLocale } from "@/hooks/useLocale";
import { TranslatableText } from "@/utils/TranslatableText";
import ArrowUpIcon from "../../../../../public/assets/arrow-up.svg";
import ArrowDownIcon from "../../../../../public/assets/arrow-down.svg";
import { useState } from "react";

export const RefundInformation = () => {
  const {t} = useLocale();
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div className="flex flex-row items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <TranslatableText
          titleResource={'refund_information'}
          className={'font-medium text-[14px] text-black'}
        />
        {expanded ? <ArrowUpIcon/> : <ArrowDownIcon/>}
      </div>
      {expanded && <div className={'flex flex-col space-y-4 mt-5'}>
        <div className="text-[#86898c] text-[12px] font-medium">
          <p className="pb-4">{t('lesson_refund_message_1')}</p>
          <p>{t('lesson_refund_message_2')}</p>
        </div>

        <div
          className="mt-10 text-center text-[#6b6e71] text-[10px] font-medium leading-[14px]">
          <p className="pb-4">{t('lesson_refund_message_3')}</p>
          <p>{t('lesson_refund_message_4')}</p>
          <p>{t('lesson_refund_message_5')}</p>
        </div>
      </div>}
    </div>
  )
}