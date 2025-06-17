'use client'

import { TranslatableText } from "@/utils/TranslatableText";
import { PassColumnList } from "@/app/profile/myPass/PassColumnList";
import { useState } from "react";
import { GetSubscriptionResponse } from "@/app/endpoint/subscription.endpoint";
import { ActiveSubscriptionList } from "@/app/profile/mySubscription/ActiveSubscriptionList";
import { PastSubscriptionList } from "@/app/profile/mySubscription/PastSubscriptionList";

export type SubscriptionTabType = 'active' | 'past'

export const MySubscriptionForm = ({subscriptions}: {subscriptions: GetSubscriptionResponse[]}) => {
  const [currentTab, setCurrentTab] = useState<SubscriptionTabType>('active')

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
            onClick={() => setCurrentTab('past')}
            className={`flex-1 py-4 ${
              currentTab === 'past'
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
          <ActiveSubscriptionList subscriptions={subscriptions.filter((value) => value.status == 'Active')}/>
        ) : (
          <PastSubscriptionList subscriptions={subscriptions.filter((value) => value.status != 'Active')}/>
        )}
      </div>
    </div>
  )
}