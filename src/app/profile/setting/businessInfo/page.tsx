import React from "react";
import { translate } from "@/utils/translate";

export default async function BusinessInfoPage() {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-gray-700 w-full max-w-md space-y-5">
      {[
        {label: await translate("business_name"), value: "로우그래피 주식회사"},
        {label: await translate("representative"), value: "서종렬"},
        {label: await translate("business_registration_number"), value: "804-88-03066"},
        {
          label: await translate("business_address"),
          value: "서울시 중구 서소문로 136, 3층 301-302호 18호실",
        },
        {
          label: await translate("e_commerce_registration_number"),
          value: "2023-서울중구-1300",
        },
        {
          label: await translate("customer_service_center_open_time"),
          value: await translate("help_center_open_time_value"),
        },
        {label: await translate("customer_center_phone"), value: "050-6774-3302"},
      ].map(({label, value}) => (
        <div key={label} className="flex flex-col">
          <span className="text-xs font-semibold text-gray-800">{label}</span>
          <span className="text-sm text-gray-500">{value}</span>
        </div>
      ))}
    </div>
  );
}
