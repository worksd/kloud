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
        <span>로우그래피 주식회사</span>
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
      서울시 중구 서소문로 136, 3층 301-302호 18호실
    </span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('e_commerce_registration_number')}</span>
        <span>2023-서울중구-1300</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('customer_service_center_open_time')}</span>
        <span>{await translate('help_center_open_time_value')}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold">{await translate('customer_center_phone')}</span>
        <span>050-6774-3302</span>
      </div>
    </div>
  )
}