'use client'

import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { KloudScreen, NO_DATA_ID } from "@/shared/kloud.screen";
import RightArrowIcon from "../../../../public/assets/right-arrow.svg"
import { CircleImage } from "@/app/components/CircleImage";
import { TranslatableText } from "@/utils/TranslatableText";
import { useEffect, useState } from "react";
import { PassItem } from "@/app/setting/myPass/action/PassItem";

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

const ActivePassItem = ({pass}: { pass: GetPassResponse }) => {
  return (
    <div
      className="bg-white rounded-2xl p-6 border active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none"
      onClick={() => window.KloudEvent.push(KloudScreen.MyPassDetail(pass.id))}>
      <div className="flex justify-between items-center">
        <PassItem pass={pass}/>
        <RightArrowIcon/>
      </div>
    </div>
  )
}