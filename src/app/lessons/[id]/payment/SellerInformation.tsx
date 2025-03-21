'use client'
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { TranslatableText } from "@/utils/TranslatableText";
import { StringResourceKey } from "@/shared/StringResource";
import { useState } from "react";
import ArrowUpIcon from "../../../../../public/assets/arrow-up.svg"
import ArrowDownIcon from "../../../../../public/assets/arrow-down.svg"

export const SellerInformation = ({studio}: { studio: GetStudioResponse }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={"flex flex-col"}>
      <div className="flex flex-row items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <TranslatableText
          titleResource={'seller_information'}
          className={'font-medium text-[14px] text-black'}
        />
        {expanded ? <ArrowUpIcon/> : <ArrowDownIcon/>}
      </div>
      {expanded && <div className={'flex flex-col space-y-4 mt-5'}>

        {studio.businessName &&
          <SellerInfoItem labelResource={'business_name'} value={studio?.businessName ?? ''}/>}
        {studio.businessRegistrationNumber &&
          <SellerInfoItem labelResource={'business_registration_number'} value={studio.businessRegistrationNumber}/>}
        {studio.eCommerceRegNumber &&
          <SellerInfoItem labelResource={'e_commerce_registration_number'} value={studio.eCommerceRegNumber}/>}
        {studio.representative &&
          <SellerInfoItem labelResource={'representative'} value={studio.representative}/>}
        {studio.educationOfficeRegNumber &&
          <SellerInfoItem labelResource={'education_office_registration_number'}
                          value={studio.educationOfficeRegNumber}/>}
        {studio.address && <SellerInfoItem labelResource={'business_address'} value={studio.address}/>}

      </div>}
    </div>
  )
}

function SellerInfoItem({labelResource, value}: { labelResource: StringResourceKey; value: string; }) {
  return <div className="self-stretch justify-start items-top inline-flex">
    <TranslatableText
      titleResource={labelResource} className={'w-[120px] text-[#86898c] text-[12px] font-medium leading-none'}/>
    <div className="grow basis-0 text-black text-[12px] font-medium">
      {value}
    </div>
  </div>
}