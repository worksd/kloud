'use client'
import TicketIcon from "../../../../../public/assets/ic_ticket.svg";
import React from "react";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";

export const CurrentPassPlan = ({passPlan}: { passPlan?: GetPassPlanResponse }) => {

  return (
    <div className="px-6 py-4">
      <div className="text-[13px] text-[#888] font-medium">
        {passPlan?.studio?.name}
      </div>
      <div className="flex flex-row items-center gap-3 mt-2">
        <div
          className="w-[40px] h-[40px] rounded-xl overflow-hidden flex-shrink-0 bg-[#F3F3F4] flex items-center justify-center">
          <TicketIcon/>
        </div>
        <div className="flex flex-col justify-center gap-0.5">
          <div className="text-[16px] text-black font-bold">
            {passPlan?.name}
          </div>
          <div className="text-[13px] text-[#999]">
            {passPlan?.type === 'Unlimited' && <span>모든 클래스 무제한 이용 가능</span>}
            {passPlan?.type === 'Count' && <span>클래스 {passPlan.usageLimit}회 이용 가능</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
