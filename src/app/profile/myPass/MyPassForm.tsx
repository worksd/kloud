'use client'

import { useState } from "react";
import { PassColumnList } from "@/app/profile/myPass/PassColumnList";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";

type PassTabType = 'active' | 'used'

export const MyPassForm = ({passes, myActivePassesText, myUsedPassesText, noActiveMessageText, noUsedMessageText, goPurchasePassText}: {
  passes: GetPassResponse[],
  myActivePassesText: string,
  myUsedPassesText: string,
  noActiveMessageText: string,
  noUsedMessageText: string,
  goPurchasePassText: string,
}) => {
  const [currentTab, setCurrentTab] = useState<PassTabType>('active')
  const activePasses = passes.filter(value => value.status == 'Active' || value.status == 'Pending')
  const notActivePasses = passes.filter(value => !activePasses.includes(value));

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-white z-10">
        <div className="flex border-b">
          <button
            onClick={() => setCurrentTab('active')}
            className={`flex-1 py-4 font-bold ${
              currentTab === 'active'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-400'
            }`}
          >
            {myActivePassesText}
          </button>
          <button
            onClick={() => setCurrentTab('used')}
            className={`flex-1 py-4 ${
              currentTab === 'used'
                ? 'border-b-2 border-black text-black font-bold'
                : 'text-gray-400'
            }`}
          >
            {myUsedPassesText}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {currentTab === 'active' ? (
          <PassColumnList passItems={activePasses} isActivePass={true} noItemMessage={noActiveMessageText} goPurchasePassText={goPurchasePassText}/>
        ) : (
          <PassColumnList passItems={notActivePasses} isActivePass={false} noItemMessage={noUsedMessageText}/>
        )}
      </div>
    </div>
  )
}