'use client'

import { useLocale } from "@/hooks/useLocale";
import { TranslatableText } from "@/utils/TranslatableText";
import { StringResourceKey } from "@/shared/StringResource";
import { useEffect, useState } from "react";

export const PurchaseInformation = ({price, titleResource} : { price: number, titleResource: StringResourceKey}) => {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, []);

  return (
    <div className="flex flex-col gap-y-4 px-6">
      <TranslatableText titleResource={'payment_information'} className="text-base font-bold text-left text-black"/>

      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between text-sm font-medium text-center text-black">
          <TranslatableText titleResource={titleResource}/>
          <p>{new Intl.NumberFormat("ko-KR").format(price)} {mounted ? t('won') : ''}</p>
        </div>
      </div>

      <div className="w-full h-px bg-[#D7DADD]"/>

      <div className="flex justify-between text-base font-bold text-center text-black">
        <TranslatableText titleResource={'total_amount'}/>
        <p>{new Intl.NumberFormat("ko-KR").format(price)} {mounted ? t('won') : ''}</p>
      </div>
    </div>
  )
}