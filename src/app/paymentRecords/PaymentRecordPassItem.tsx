'use client'
import { KloudScreen } from "@/shared/kloud.screen";
import { PassItem } from "@/app/profile/myPass/action/PassItem";
import RightArrowIcon from "../../../public/assets/right-arrow.svg";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";

export const PaymentRecordPassItem = ({pass}: {pass: GetPassResponse}) => {
  return (
    <div
      className="bg-white p-6 active:scale-[0.98] active:bg-gray-100 transition-all duration-150 select-none"
      onClick={() => kloudNav.push(KloudScreen.MyPassDetail(pass.id))}>
      <div className="flex justify-between items-center space-x-4">
        <PassItem pass={pass}/>
        <RightArrowIcon/>
      </div>
    </div>
  )
}