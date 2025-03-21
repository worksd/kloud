'use client'
import TicketIcon from "../../../../../public/assets/ic_ticket.svg";
import React from "react";

export const CurrentPassPlan = () => {

  return (
    <div className={"px-6"}>
      <div className={"text-[16px] text-black  font-medium"}>
        서울 댄스 스튜디오
      </div>
      <div className={"flex flex-row justify-between items-center"}>
        <div className={"flex flex-row items-center space-x-3"}>
          <div
            className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0 bg-[#F3F3F4] flex items-center justify-center my-5">
            <TicketIcon/>
          </div>
          <div className={"text-[16px] text-black font-medium"}>
            1 Class
          </div>
        </div>
      </div>
    </div>
  )
}