'use client'
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { Locale } from "@/shared/StringResource";
import { useState } from "react";
import ArrowUpIcon from "../../../../../public/assets/arrow-up.svg"
import ArrowDownIcon from "../../../../../public/assets/arrow-down.svg"
import { getLocaleString } from "@/app/components/locale";

export const SellerInformation = ({studio, locale}: { studio: GetStudioResponse, locale: Locale }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={"flex flex-col"}>
      <div className="flex flex-row items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div
          className={'font-medium text-[14px] text-black'}
        >{getLocaleString({locale, key: 'seller_information'})}</div>
        {expanded ? <ArrowUpIcon/> : <ArrowDownIcon/>}
      </div>
      {expanded && <div className={'flex flex-col space-y-4 mt-5'}>

        {studio.businessName &&
          <SellerInfoItem label={getLocaleString({locale, key: 'business_name'})} value={studio?.businessName ?? ''}/>}
        {studio.businessRegistrationNumber &&
          <SellerInfoItem label={getLocaleString({locale, key: 'business_registration_number'})} value={studio.businessRegistrationNumber}/>}
        {studio.eCommerceRegNumber &&
          <SellerInfoItem label={getLocaleString({locale, key: 'e_commerce_registration_number'})} value={studio.eCommerceRegNumber}/>}
        {studio.representative &&
          <SellerInfoItem label={getLocaleString({locale, key: 'representative'})} value={studio.representative}/>}
        {studio.educationOfficeRegNumber &&
          <SellerInfoItem label={getLocaleString({locale, key: 'education_office_registration_number'})}
                          value={studio.educationOfficeRegNumber}/>}
        {studio.address && <SellerInfoItem label={getLocaleString({locale, key: 'business_address'})} value={studio.address}/>}

      </div>}
    </div>
  )
}

function SellerInfoItem({label, value}: { label: string; value: string; }) {
  return <div className="self-stretch justify-start items-top inline-flex">
    <div className={'w-[120px] text-[#86898c] text-[12px] font-medium leading-none'}>
      {label}
    </div>
    <div className="grow basis-0 text-black text-[12px] font-medium">
      {value}
    </div>
  </div>
}