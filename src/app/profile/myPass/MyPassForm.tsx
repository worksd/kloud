'use client'

import { useState } from "react";
import { PassColumnList } from "@/app/profile/myPass/PassColumnList";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import BackArrowIcon from "../../../../public/assets/ic_back_arrow.svg";

type PassTabType = 'active' | 'used'

export const MyPassForm = ({passes, locale}: {
  passes: GetPassResponse[],
  locale: Locale,
}) => {
  const [currentTab, setCurrentTab] = useState<PassTabType>('active')
  const activePasses = passes.filter(value => value.status == 'Active' || value.status == 'Pending' || value.status == 'Waiting')
  const notActivePasses = passes.filter(value => !activePasses.includes(value));

  return (
    <div className="flex flex-col h-full">
      {/* Header: Back Arrow + Tabs */}
      <div className="flex flex-row items-center gap-4 px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={() => (window as any).KloudEvent?.back()} className="flex items-center justify-start flex-shrink-0">
          <BackArrowIcon className="w-6 h-6 text-black"/>
        </button>
        <button
          onClick={() => setCurrentTab('active')}
          className={`transition-all duration-300 ${
            currentTab === 'active'
              ? 'text-[20px] text-black font-bold'
              : 'text-[16px] text-gray-400 font-medium'
          }`}
        >
          {getLocaleString({locale, key: 'my_active_passes'})}
        </button>
        <button
          onClick={() => setCurrentTab('used')}
          className={`transition-all duration-300 ${
            currentTab === 'used'
              ? 'text-[20px] text-black font-bold'
              : 'text-[16px] text-gray-400 font-medium'
          }`}
        >
          {getLocaleString({locale, key: 'my_used_passes'})}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {currentTab === 'active' ? (
          <PassColumnList passItems={activePasses} isActivePass={true} locale={locale}/>
        ) : (
          <PassColumnList passItems={notActivePasses} isActivePass={false} locale={locale}/>
        )}
      </div>
    </div>
  )
}
