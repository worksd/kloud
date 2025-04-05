'use client'

import { useState } from "react";
import { PassColumnList } from "@/app/setting/myPass/PassColumnList";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { TranslatableText } from "@/utils/TranslatableText";

type PassTabType = 'active' | 'used'

export const MyPassForm = ({passes}: { passes: GetPassResponse[] }) => {
  const [currentTab, setCurrentTab] = useState<PassTabType>('active')
  const activePasses = passes.filter(value => value.status == 'Active' || value.status == 'Pending')
  const notActivePasses = passes.filter(value => !activePasses.includes(value));

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
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
            <TranslatableText titleResource={'my_active_passes'}/>
          </button>
          <button
            onClick={() => setCurrentTab('used')}
            className={`flex-1 py-4 ${
              currentTab === 'used'
                ? 'border-b-2 border-black text-black font-bold'
                : 'text-gray-400'
            }`}
          >
            <TranslatableText titleResource={'my_used_passes'}/>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {currentTab === 'active' ? (
          <PassColumnList passItems={activePasses} isActivePass={true}/>
        ) : (
          <PassColumnList passItems={notActivePasses} isActivePass={false}/>
        )}
      </div>
    </div>
  )
}