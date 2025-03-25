'use client'
import TicketIcon from "../../../../../public/assets/ic_ticket.svg";
import React from "react";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";

export const CurrentPassPlan = ({passPlan} : {passPlan?: GetPassPlanResponse}) => {

  return (
    <div className={"px-6"}>
      <div className={"text-[16px] text-black font-medium"}>
        {passPlan?.studio?.name}
      </div>
      <div className={"flex flex-row justify-between items-center"}>
        <div className={"flex flex-row items-center space-x-3"}>
          <div
            className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0 bg-[#F3F3F4] flex items-center justify-center my-5">
            <TicketIcon/>
          </div>
          <div className={"text-[16px] text-black font-medium"}>
            {passPlan?.name}
          </div>
        </div>
      </div>
    </div>
  )
}