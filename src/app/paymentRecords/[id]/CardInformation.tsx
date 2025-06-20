import { TranslatableText } from "@/utils/TranslatableText";
import ArrowUpIcon from "../../../../public/assets/arrow-up.svg";
import ArrowDownIcon from "../../../../public/assets/arrow-down.svg";
import { useState } from "react";

export const CardInformation = ({receiptUrl}: { receiptUrl: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex flex-row items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <TranslatableText
          titleResource={'card_information'}
          className={'font-medium text-[14px] text-black'}
        />
        {expanded ? <ArrowUpIcon/> : <ArrowDownIcon/>}
      </div>
      {expanded &&
        <div className={'flex flex-col space-y-4 mt-5'}>
          <iframe
            src={receiptUrl}
            style={{
              width: '100%',
              height: '1000px',
              border: 'none',
              overflow: 'hidden',
            }}
            scrolling="no"
          />
        </div>
      }
    </div>
  )
}