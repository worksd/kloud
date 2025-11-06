'use client'

import { Locale, StringResourceKey } from "@/shared/StringResource";
import { PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { getLocaleString } from "@/app/components/locale";

export const PurchaseInformation = ({price, method, titleResource, locale}: {
  price: number,
  method?: PaymentMethodType,
  titleResource: StringResourceKey,
  locale: Locale
}) => {

  return (
    <div className="flex flex-col gap-y-4 px-6">
      <div className="text-base font-bold text-left text-black">{getLocaleString({
        locale,
        key: 'payment_information'
      })}</div>

      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between text-sm font-medium text-center text-black">
          <div>{getLocaleString({locale, key: titleResource})}</div>
          <p>{new Intl.NumberFormat("ko-KR").format(price)} {getLocaleString({locale, key: 'won'})}</p>
        </div>
      </div>

      <div className="w-full h-px bg-[#D7DADD]"/>

      <div className="flex justify-between text-base font-bold text-center text-black">
        <div>{getLocaleString({locale, key: 'total_amount'})}</div>
        <p>{new Intl.NumberFormat("ko-KR").format(method == 'pass' ? 0 : price)} {getLocaleString({
          locale,
          key: 'won'
        })}</p>
      </div>
    </div>
  )
}