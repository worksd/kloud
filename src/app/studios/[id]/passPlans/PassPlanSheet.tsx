'use client'
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { PassPlanItem } from "@/app/passPlans/PassPlanItem";
import React from "react";

export type PassPlanEventDetail = {
  passPlanId: string;
}

export const PassPlanSheet = ({passPlans, currentPassPlanId}: {
  passPlans: GetPassPlanResponse[],
  currentPassPlanId: string
}) => {

  const handleClickPassPlan = (item: GetPassPlanResponse) => {

    window.KloudEvent.closeBottomSheet()
    // 이벤트 디스패치 시 passPlanId를 detail로 포함
    const event = new CustomEvent<PassPlanEventDetail>("changeCurrentPassPlan", {
      detail: { passPlanId: item.id.toString() },
    });
    document.dispatchEvent(event);
  }
  //


  return (
    <ul className="flex flex-col p-6 space-y-4 mt-4">
      {passPlans.map((item) => (
        <PassPlanItem
          key={item.id}
          item={item}
          isSelected={currentPassPlanId == `${item.id}`}
          onClickAction={handleClickPassPlan}/>
      ))}
    </ul>
  )
}