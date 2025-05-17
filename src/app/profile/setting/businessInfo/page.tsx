import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";
import { translate } from "@/utils/translate";

export default async function BusinessInfoPage() {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-sm text-gray-700 space-y-2 w-full max-w-md">
      <div className="flex justify-between items-center mb-14 px-6">
        <SimpleHeader titleResource="business_info"/>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('business_name')}</span>
        <span>주식회사 웍스앤피플</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('representative')}</span>
        <span>서종렬</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('business_registration_number')}</span>
        <span>804-88-03066</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('business_address')}</span>
        <span className="text-right">
      서울시 중구 퇴계로 36길 2 비254호
    </span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('e_commerce_registration_number')}</span>
        <span>2023-서울중구-1300</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('customer_center')}</span>
        <span>050-6774-3302</span>
      </div>
    </div>
  )
}