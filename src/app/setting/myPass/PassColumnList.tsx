'use client'

import { GetPassResponse, PassPlanTier } from "@/app/endpoint/pass.endpoint";
import { KloudScreen, NO_DATA_ID } from "@/shared/kloud.screen";
import PremiumTierIcon from "../../../../public/assets/ic_premium_pass_plan.svg"
import { TranslatableText } from "@/utils/TranslatableText";
import { useEffect, useState } from "react";
import { PassItem } from "@/app/setting/myPass/action/PassItem";

export const PassColumnList = ({
                           passItems,
                           isActivePass,
                         }: { passItems: GetPassResponse[], isActivePass: boolean }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, [])
  if (passItems && passItems.length > 0) {
    return (
      <div className={"flex flex-col text-black"}>
        <div className="flex flex-col space-y-4 py-4">
          {passItems.map((item) => (
            <ActivePassItem
              key={item.id}
              pass={item}
            />
          ))}
        </div>
      </div>
    )
  } else {
    if (!mounted) return;
    return (
      <div className={'flex flex-col justify-center pt-36 items-center space-y-4 text-center'}>
        {isActivePass && <div
          className={'text-[14px] text-black font-bold border rounded-full border-black px-4 py-3 active:scale-[0.98] active:bg-gray-100 transition-transform duration-150 text-center'}
          onClick={() => window.KloudEvent?.push(KloudScreen.PurchasePass(NO_DATA_ID))}><TranslatableText
          titleResource={'go_purchase_pass_title'}/></div>}
        <TranslatableText titleResource={isActivePass ? 'no_active_passes_message' : 'no_used_passes_message'}
                          className={'text-[#85898C] font-medium text-[16px] text-center'}/>
      </div>
    )
  }
}

export const ActivePassItem = ({ pass }: { pass: GetPassResponse }) => {
  const borderColor =
    pass.passPlan?.tier === PassPlanTier.Premium ? 'border-[#E1CBFE]' : 'border-[#F1F3F6]'

  const backgroundColor = pass.passPlan?.tier === PassPlanTier.Premium ? 'bg-[#FBFBFF]' : 'bg-white'

  return (
    <div
      className={`${backgroundColor} rounded-2xl p-6 border ${borderColor} active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none`}
      onClick={() => window.KloudEvent.push(KloudScreen.MyPassDetail(pass.id))}
    >
      <div className="flex justify-between items-center space-x-4">
        <PassItem pass={pass}/>
        {pass.passPlan?.tier === PassPlanTier.Premium &&
          <PremiumTierIcon/>
        }
      </div>
    </div>
  )
}