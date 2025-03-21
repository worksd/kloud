'use client'

import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import RightArrowIcon from "../../../../public/assets/right-arrow.svg"
import { CircleImage } from "@/app/components/CircleImage";
import { TranslatableText } from "@/utils/TranslatableText";
import { useEffect, useState } from "react";

export const PassList = ({
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
        <div className="flex flex-col space-y-4 p-4">
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
      <div className={'flex flex-col justify-center pt-36 items-center space-y-4 '}>
        {isActivePass && <div
          className={'text-[14px] text-black font-bold border rounded-full border-black px-4 py-3 active:scale-[0.98] active:bg-gray-100 transition-transform duration-150'}
          onClick={() => window.KloudEvent?.push(KloudScreen.PurchasePass)}><TranslatableText
          titleResource={'go_purchase_pass_title'}/></div>}
        <TranslatableText titleResource={isActivePass ? 'no_active_passes_message' : 'no_used_passes_message'}
                          className={'text-[#85898C] font-medium text-[16px]'}/>
      </div>
    )
  }
}

const ActivePassItem = ({pass}: { pass: GetPassResponse }) => {
  return (
    <div
      className="bg-white rounded-2xl p-6 border active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none"
      onClick={() => window.KloudEvent.push(KloudScreen.MyPassDetail(pass.id))}>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <CircleImage size={24} imageUrl={pass.plan?.studio?.profileImageUrl}/>
          <h2 className="text-xl font-semibold">{pass.plan?.name}</h2>
          <div className="flex items-center space-x-2 text-gray-500">
            <span className={'text-[#FF434F] font-bold'}>D-10</span>
            <span className={'text-[#A4A4A4] font-medium'}>|</span>
            <span className={'text-[#A4A4A4] font-medium'}>25.03.03까지</span>
          </div>
        </div>
        <RightArrowIcon/>
      </div>
    </div>
  )
}