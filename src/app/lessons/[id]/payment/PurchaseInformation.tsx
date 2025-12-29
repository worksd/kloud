'use client'

import { Locale, StringResourceKey } from "@/shared/StringResource";
import { PaymentMethodType, DiscountResponse } from "@/app/endpoint/payment.endpoint";
import { getLocaleString } from "@/app/components/locale";

export const PurchaseInformation = ({originalPrice, totalPrice, method, titleResource, locale, discounts}: {
  originalPrice: number,
  totalPrice: number,
  method?: PaymentMethodType,
  titleResource: StringResourceKey,
  locale: Locale,
  discounts?: DiscountResponse[]
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
          <p>{new Intl.NumberFormat("ko-KR").format(originalPrice)} {getLocaleString({locale, key: 'won'})}</p>
        </div>
        {discounts && discounts.length > 0 && discounts.map((discount, index) => (
          <div key={index} className="flex justify-between text-sm font-medium text-center text-[#FF3B30]">
            <div>{discount.key}</div>
            <p className="text-[#FF3B30]">-{new Intl.NumberFormat("ko-KR").format(parseInt(discount.value.replace(/,/g, '')))} {getLocaleString({locale, key: 'won'})}</p>
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-[#D7DADD]"/>

      <div className="flex justify-between text-base font-bold text-center text-black">
        <div>{getLocaleString({locale, key: 'total_amount'})}</div>
        <p>{new Intl.NumberFormat("ko-KR").format(method == 'pass' ? 0 : totalPrice)} {getLocaleString({
          locale,
          key: 'won'
        })}</p>
      </div>
    </div>
  )
}