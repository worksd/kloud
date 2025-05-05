'use client'
import TicketIcon from "../../../../../public/assets/ic_ticket.svg";
import React from "react";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";

export const CurrentPassPlan = ({passPlan}: { passPlan?: GetPassPlanResponse }) => {

  return (
    <div className={"px-6"}>
      <div className={"text-[16px] text-black font-medium"}>
        {passPlan?.studio?.name}
      </div>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center space-x-3 my-3">
          <div
            className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0 bg-[#F3F3F4] flex items-center justify-center">
            <TicketIcon/>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[16px] text-black font-medium">
              {passPlan?.name}
            </div>
            <div className="text-[12px] text-[#A4A4A4] font-paperlogy">
              {passPlan?.type === 'Unlimited' && <div>모든 클래스 무제한 이용 가능</div>}
              {passPlan?.type === 'Count' && <div>클래스 {passPlan.usageLimit}회 이용 가능</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}